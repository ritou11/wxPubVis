#!/usr/bin/env python3
# coding: utf-8
import pickle
from pymongo import MongoClient
import traceback
from gensim import corpora, similarities
import pandas as pd
import numpy as np
import gensim
from gensim.utils import simple_preprocess
from gensim.parsing.preprocessing import STOPWORDS
from gensim.corpora import Dictionary
import os
from pprint import pprint
import jieba

load_df = False


def load_stopwords():
    f_stop = open('stop_words.txt', 'r')
    sw = [line.strip() for line in f_stop]
    f_stop.close()
    return sw


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

pid = []
tit = []
dig = []
con = []
readNum = []

if os.path.exists('cutted.pkl'):
    with open('cutted.pkl', 'rb') as f:
        df = pickle.load(f)
    print("loaded from old...")
else:
    print('data preprocessing...')
    cursor = pstcol.find(no_cursor_timeout=True)
    for i, s in enumerate(cursor):
        if (i % 10 == 0):
            print(f'\r{i}', end='', flush=True)
        if 'content' in s.keys():
            pid.append(str(s['_id']))
            tit.append(s['title'])
            dig.append(s['digest'])
            con.append(s['content'])
            if 'readNum' in s.keys():
                readNum.append(s['readNum'])
            else:
                readNum.append(0)
    cursor.close()
    print()
    dic = {"pid": pid,
           "title": tit,
           "digest": dig,
           "content": con,
           "readNum": readNum}
    df = pd.DataFrame(dic)
    con = df['title'] + df['content']
    stopwords = load_stopwords()
    df["con"] = con
    df["con_cutted"] = df.con.apply(word_cut)
    with open('cutted.pkl', 'wb') as f:
        pickle.dump(df, f)
    print('done.')

# 每一个单词关联一个唯一的ID
docs = [[word for word in df.con_cutted[i].split()] for i in range(0, len(df))]
word_count_dict = Dictionary(docs)
# 过滤高频低频词
word_count_dict.filter_extremes(no_below=5, no_above=0.5)
# 将文档表示成词袋向量
bag_of_words_corpus = [word_count_dict.doc2bow(perdoc) for perdoc in docs]

# 保存模型
model_name = "./model.lda"
if os.path.exists(model_name):
    lda_model = gensim.models.LdaModel.load(model_name)
    print("loaded from old")
else:
    # preprocess()  第一个参数为选用的文档向量，num_topics为主题个数，id2word可选是选用的字典，
    lda_model = gensim.models.LdaModel(
        bag_of_words_corpus, num_topics=80, id2word=word_count_dict)
    lda_model.save(model_name)
    print("loaded from new")

perdoc = db.perdoc
topic_num = 3

for i in range(0, len(df)):
    doc = [word for word in df.con_cutted[i].split()]
    doc_dict = word_count_dict.doc2bow(doc)
    result = lda_model[doc_dict]
    result = sorted(result, key=lambda tup: -1 * tup[1])  # 排序，只取前三的主题
    idx = 1
    postWithTheme = dict()
    postWithTheme['pid'] = df['pid'][i]
    postWithTheme['themes'] = list()
    print(f'\r文章{i + 1} ', end='')
    for topic in result:
        if idx > topic_num:
            break
        postTheme = dict()
        postTheme['theme'] = f'主题{idx}'
        print(f'主题{idx}', end=' ')
        postTheme['weight'] = topic[1].item()
        freq_word = lda_model.show_topic(topic[0], 30)
        for fw in freq_word:
            if 'words' in postTheme.keys():
                postTheme['words'].append({'name': fw[0], 'freq': fw[1].item()})
            else:
                postTheme['words'] = [{'name': fw[0], 'freq': fw[1].item()}]
        postWithTheme['themes'].append(postTheme)
        idx += 1
    result = perdoc.update_one({'pid': postWithTheme['pid']}, {
                               '$set': postWithTheme}, upsert=True)

print(perdoc.count_documents({}))
