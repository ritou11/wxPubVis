from bson.objectid import ObjectId
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import pandas as pd
import jieba
from sklearn.metrics.pairwise import linear_kernel
import pickle
import os


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


# 连接数据库
conn = MongoClient("mongodb://localhost:27017")
db = conn.wechat_spider


pstcol = db.posts
pstcursor = pstcol.find(no_cursor_timeout=True)
#prfcursor = prfcol.find(no_cursor_timeout=True)


if os.path.exists('cutted.pkl'):
    with open('cutted.pkl', 'rb') as f:
        df = pickle.load(f)
    print("loaded from old...")
else:
    print('data preprocessing...')
    pid = []
    pubname = []
    tit = []
    dig = []
    con = []
    readNum = []

    for i, s in enumerate(pstcursor):
        if 'content' in s:
            pid.append(str(s['_id']))
            tit.append(str(s['title']))
            dig.append(str(s['digest']))
            con.append(str(s['content']))
            if 'readNum' in s:
                readNum.append(str(s['readNum']))
            else:
                readNum.append(0)

    pstcursor.close()

    dic = {"pid": pid,
           "title": tit,
           "digest": dig,
           "content": con,
           "readNum": readNum}
    df = pd.DataFrame(dic)
    con = df['title'] + df['content']

    print('load stopwords...')
    stopwords = load_stopwords()
    df["con"] = con

    print('cut words...')
    df["con_cutted"] = df.con.apply(word_cut)

    with open('cutted.pkl', 'wb') as f:
        pickle.dump(df, f)

    print('done.')

tfidf = TfidfVectorizer().fit_transform(df["con_cutted"])

# print(tfidf)#tuple类型

for i in range(0, len(df)):
    print(f'\r文章{i+1}', end='')
    cosine_similarities = linear_kernel(tfidf[i], tfidf).flatten()
    related_docs_indices = cosine_similarities.argsort()[:-11:-1]  # 取前四个相似文章
    set = {'related': [{
        'pId': df["pid"][r],
        'simi': cosine_similarities[r].item()
    } for r in related_docs_indices]}
    pstcol.update_one({'_id': ObjectId(df["pid"][i])}, {
        '$set': set
    }, upsert=False)
