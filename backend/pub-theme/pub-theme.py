# encoding=utf-8

import jieba
from pymongo import MongoClient
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import TfidfTransformer


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


def extractPubPosts(msg):

    pid = []
    pubname = []
    tit = []
    dig = []
    con = []
    readNum = []

    print(msg['msgBiz'])

    pstcursor = pstcol.find(msg)

    prfcursor = prfcol.find()

    for i, s in enumerate(pstcursor):
        if 'content' in s:
            for idx, pn in enumerate(prfcursor):
                print(idx)
                print(str(pn['msgBiz']))
                if msg['msgBiz'] == str(pn['msgBiz']):
                    pname = pn['title']
            pubname.append(str(pname))
            pid.append(str(s['_id']))
            tit.append(str(s['title']))
            dig.append(str(s['digest']))
            con.append(str(s['content']))
            if 'readNum' in s:
                readNum.append(str(s['readNum']))
            else:
                readNum.append(0)
    dic = {"pid": pid,
           "pubname": pubname,
           "title": tit,
           "digest": dig,
           "content": con,
           "readNum": readNum}

    df = pd.DataFrame(dic)

    return df

#theme:{msgBiz, theme, weight}
# post:{msgBiz, pid, theme:[name, weight, contrib]}


# 连接数据库
conn = MongoClient("mongodb://127.0.0.1:27017")
db = conn.wechat_spider

pstcol = db.posts
prfcol = db.profiles
stopwords = load_stopwords()

post = db.post

theme = db.theme

prfcursor = prfcol.find()

for num, pn in enumerate(prfcursor):

    print(num)

    msg = {"msgBiz": str(pn['msgBiz'])}

    df = extractPubPosts(msg)

    print(df)

    con = df['title'] + df['content']

    df["con"] = con

    df["con_cutted"] = df.con.apply(word_cut)

    n_features = 1000
    n_topics = 30
    n_top_words = 50

    tf_vectorizer = CountVectorizer(max_features=n_features,
                                    stop_words='english',
                                    max_df=0.4,
                                    min_df=10)

    tf = tf_vectorizer.fit_transform(df.con_cutted)

    lda = LatentDirichletAllocation(learning_method='online',
                                    n_components=n_topics,
                                    perp_tol=0.001,
                                    doc_topic_prior=0.001,
                                    topic_word_prior=0.001,
                                    max_iter=300)
    lda.fit(tf)

    tf_feature_names = tf_vectorizer.get_feature_names()
    print("主题-相关词")
    print_top_words(lda, tf_feature_names, n_top_words)
    print('\n')
    print('\n')
    print("文章-主题权重")
    docres = doc_top(lda, tf)
    print(docres)
    print("\n文章-主题贡献")
    readn = df['readNum']
    readnum = np.array(df['readNum']).reshape(len(readn), 1)
    readnum = readnum.repeat(30, axis=1)
    readnum = readnum.astype(np.float)
    contrib = np.multiply(docres, readnum)
    print(contrib)
    for idx in range(0, len(df)):
        post_dict = {}
        post_dict['msgBiz'] = str(pn['msgBiz'])
        post_dict['pid'] = str(df['pid'][idx])
        for j in range(0, n_topics):
            if 'theme' in post_dict:
                post_dict['theme'].append({'name': str(
                    "主题" + str(j + 1)), 'weight': docres[idx][j], 'contrib': contrib[idx][j]})
            else:
                post_dict['theme'] = [{'name': str(
                    "主题" + str(j + 1)), 'weight': docres[idx][j], 'contrib':contrib[idx][j]}]
        print(post_dict)
        result = post.insert_one(post_dict)
        print(result)
    top_dict = []
    for idx in range(0, n_topics):
        sum_contrib = 0
        for j in range(0, len(df)):
            sum_contrib += contrib[j][idx]
        top_dict.append({'msgBiz': str(pn['msgBiz']), 'name': str(
            "主题" + str(idx + 1)), 'importance': str(sum_contrib)})
    print(top_dict)
    result = theme.insert_many(top_dict)
    print(result)
