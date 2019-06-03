# encoding=utf-8
import os
import jieba
from pymongo import MongoClient
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import TfidfTransformer
import pickle


def load_stopwords():
    f_stop = open('stop_words.txt', 'r')
    sw = [line.strip() for line in f_stop]
    f_stop.close()
    return sw

# 分词+过滤停用词


def word_cut(text):
    text = str(text)
    seg = jieba.cut(text.strip())
    outstr = ""
    for word in seg:
        if word not in stopwords:
            if word != '\t':
                outstr += word
                outstr += " "
    return outstr

# 打印每个主题的前50个相关词


def print_top_words(model, feature_names, n_top_words):
    for topic_idx, topic in enumerate(model.components_):
        print("Topic #%d:" % topic_idx)
        print(" ".join([str(feature_names[i])
                        for i in topic.argsort()[:-n_top_words - 1:-1]]))

# 文章主题权重


def doc_top(model, tf):
    docres = model.fit_transform(tf)
    return docres


def extractPubPosts(msg, pname):

    pid = list()
    pubname = list()
    tit = list()
    dig = list()
    con = list()
    readNum = list()

    pstcursor = pstcol.find(msg)

    prfcursor = prfcol.find_one(msg)

    for i, s in enumerate(pstcursor):
        if 'content' in s:
            pubname.append(pname)
            pid.append(str(s['_id']))
            tit.append(str(s['title']))
            dig.append(str(s['digest']))
            con.append(str(s['content']))
            if 'readNum' in s:
                readNum.append(s['readNum'])
            else:
                readNum.append(0)

    df = pd.DataFrame({
        'pid': pid,
        'pubname': pubname,
        'title': tit,
        'digest': dig,
        'content': con,
        'readNum': readNum
    })

    return df

# theme:{msgBiz, theme, weight}
# post:{msgBiz, pid, theme:[name, weight, contrib]}


# 连接数据库
conn = MongoClient("mongodb://localhost:27017")
db = conn.wechat_spider

pstcol = db.posts
prfcol = db.profiles
stopwords = load_stopwords()

post = db.pubposts

theme = db.perpub

prfcursor = prfcol.find(no_cursor_timeout=True)

for num, pn in enumerate(prfcursor):
    print(f'#{num + 1} profile {pn["title"]}...')

    cuttedName = f'{pn["msgBiz"]}.pkl'
    if os.path.exists(cuttedName):
        with open(cuttedName, 'rb') as f:
            df = pickle.load(f)
        print("Cut loaded from old")
    else:
        print('jieba...')
        df = extractPubPosts({
            'msgBiz': pn['msgBiz']
        }, pn['title'])
        con = df['title'] + df['content']
        df['con'] = con
        df['con_cutted'] = df.con.apply(word_cut)
        with open(cuttedName, 'wb') as f:
            pickle.dump(df, f)
        print('Done jieba!')

    print(f'{len(df)} posts in the profile.')
    if len(df) <= 1:
        continue

    n_features = 1000
    n_topics = 30
    n_top_words = 50

    tf_vectorizer = CountVectorizer(max_features=n_features,
                                    stop_words='english',
                                    max_df=0.4,
                                    min_df=10)
    tf = tf_vectorizer.fit_transform(df.con_cutted)
    print('Done fit_transform!')

    ldaName = f'{pn["msgBiz"]}.lda'
    if os.path.exists(ldaName):
        with open(ldaName, 'rb') as f:
            lda = pickle.load(f)
        print("LDA loaded from old")
    else:
        print('lda...')
        lda = LatentDirichletAllocation(learning_method='online',
                                        n_components=n_topics,
                                        perp_tol=0.001,
                                        doc_topic_prior=0.001,
                                        topic_word_prior=0.001,
                                        max_iter=300,
                                        n_jobs=-1,
                                        verbose=1)
        lda.fit(tf)
        with open(ldaName, 'wb') as f:
            pickle.dump(lda, f)
        print('Done lda!')

    tf_feature_names = tf_vectorizer.get_feature_names()

    print("文章-主题权重")
    docresName = f'{pn["msgBiz"]}-docres.lda'
    if os.path.exists(docresName):
        with open(docresName, 'rb') as f:
            docres = pickle.load(f)
        print("Docres loaded from old")
    else:
        print('docres...')
        docres = doc_top(lda, tf)
        with open(docresName, 'wb') as f:
            pickle.dump(docres, f)
        print('Done docres!')

    print("文章-主题贡献")
    readn = df['readNum']
    readnum = np.array(df['readNum']).reshape(len(readn), 1)
    readnum = readnum.repeat(30, axis=1)
    readnum = readnum.astype(np.float)
    contrib = np.multiply(docres, readnum)

    for idx in range(0, len(df)):
        post_dict = dict()
        post_dict['msgBiz'] = str(pn['msgBiz'])
        post_dict['pId'] = str(df['pid'][idx])
        for j in range(n_topics):
            if 'themes' in post_dict:
                post_dict['themes'].append({
                    'name': f'主题{j + 1}',
                    'weight': docres[idx][j],
                    'contrib': contrib[idx][j]
                })
            else:
                post_dict['themes'] = [{
                    'name': f'主题{j + 1}',
                    'weight': docres[idx][j],
                    'contrib': contrib[idx][j]
                }]
        result = post.update_one({'pId': post_dict['pId']},
                                 {'$set': post_dict}, upsert=True)
    top_dict = {
        'msgBiz': pn['msgBiz'],
        'themes': []
    }
    for idx in range(n_topics):
        sum_contrib = 0
        for j in range(len(df)):
            sum_contrib += contrib[j][idx]
        keywords = [str(tf_feature_names[i])
                    for i in lda.components_[idx].argsort()[:-n_top_words - 1:-1]]
        top_dict['themes'].append({
            'name': f'主题{idx + 1}',
            'importance': str(sum_contrib),
            'keywords': keywords
        })
    print(top_dict)
    result = theme.update_one({
        'msgBiz': top_dict['msgBiz']
    }, {'$set': top_dict}, upsert=True)

prfcursor.close()
