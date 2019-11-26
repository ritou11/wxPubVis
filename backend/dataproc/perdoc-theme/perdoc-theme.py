#-*-coding:utf-8-*-
from pymongo import MongoClient
import gensim
from gensim.utils import simple_preprocess
from gensim.parsing.preprocessing import STOPWORDS
from gensim.corpora import Dictionary
import os
from pprint import pprint
import jieba
import numpy as np
import pandas as pd
from gensim import corpora, similarities
import traceback


def load_stopwords():
    f_stop = open('stop_words.txt', 'r')
    sw = [line.strip() for line in f_stop]
    f_stop.close()
    return sw

#分词+过滤停用词
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
    
def similarity( i, query, dictionary, corpus_tfidf ):
    
    # 建立索引
    index = similarities.MatrixSimilarity(corpus_tfidf)

    # 在dictionary建立query的vsm_tf表示
    query_bow = dictionary.doc2bow( query.lower().split() )

    # 查询在n_topics维空间的表示
    query_lda = tf_idf_model[query_bow]

    # 计算相似度
    simi = index[query_lda]
    query_simi_list = []
    for idx, item in enumerate(simi):
        if idx != i :
            query_simi_list.append( {'pid':str(df['pid'][i]), 'sid':str(df['pid'][idx]), 'similarity':str(item)} )
    print(query_simi_list)
    result = sim.insert_many(query_simi_list)

#连接数据库
conn = MongoClient("mongodb://127.0.0.1:27017")
db = conn.wechat_spider


pstcol = db.posts
cursor = pstcol.find(no_cursor_timeout=True)

pid = []
pubname = []
tit = []
dig = []
con = []
readNum = []

for i, s in enumerate(cursor):
    print(str(s['title']))
    print('\n')
    if 'content' in s:
        if s['msgBiz'] =="MjM5MDc0NTY2OA==":
            pubname.append(str('洞见'))
        elif s['msgBiz'] == "MzUxODM4OTYzMg==":
            pubname.append(str('清华小五爷园'))
        elif s['msgBiz'] == "MzA4MjEyNTA5Mw==":
            pubname.append(str('Python开发者'))
        elif s['msgBiz'] == "MzI1NDY5NDM3OQ==":
            pubname.append(str('凤凰WEEKLY'))
        else:
            pubname.append(str('沃顿商业'))
        pid.append(str(s['_id']))
        tit.append(str(s['title']))
        dig.append(str(s['digest']))
        con.append(str(s['content']))
        if 'readNum' in s:
            readNum.append(str(s['readNum']))
        else:
            readNum.append(0)
dic = {"pid":pid,
        "pubname":pubname,
        "title":tit,
       "digest":dig,
       "content":con,
      "readNum":readNum}

df = pd.DataFrame(dic)

df.head()

con = df['title'] + df['content']

stopwords = load_stopwords()

df["con"] = con

df["con_cutted"] = df.con.apply(word_cut)

df.con_cutted.head()

#每一个单词关联一个唯一的ID
docs = [ [word for word in df.con_cutted[i].split() ] for i in range(0,len(df)) ]
word_count_dict = Dictionary(docs)
#过滤高频低频词
word_count_dict.filter_extremes(no_below=5, no_above=0.5) 
#将文档表示成词袋向量
bag_of_words_corpus = [word_count_dict.doc2bow(perdoc) for perdoc in docs] 

#保存模型
model_name = "./model.lda"  
if os.path.exists(model_name):
    lda_model = gensim.models.LdaModel.load(model_name)  
    print("loaded from old")
else:
    # preprocess()  第一个参数为选用的文档向量，num_topics为主题个数，id2word可选是选用的字典，
    lda_model = gensim.models.LdaModel(bag_of_words_corpus, num_topics=80, id2word=word_count_dict)
    lda_model.save(model_name)  
    print("loaded from new")

#{pid:“pid”, theme: “主题1”, words: [{name:’”xxx”‘, freq:“123”}], weight：“数值”}

perdoc = db.perdoc
topic_num=3

for i in range(0,len(df)):
    if i == 2:
        continue
    doc = [ word for word in df.con_cutted[i].split() ]
    doc_dict = word_count_dict.doc2bow(doc)
    result=lda_model[doc_dict]
    result=sorted(result,key=lambda tup: -1 * tup[1])#排序，只取前三的主题
    idx = 1
    dd = []
    for topic in result:
        if idx>topic_num:
            break
        dict = {}
        dict['pid'] = str(df['pid'][i])
        print("文章"+str(i+1))
        #print_topic(x,y) x是主题的id，y是打印该主题的前y个词，词是按权重排好序的
        dict['theme'] = str("主题"+str(idx))
        print("主题"+str(idx))
        dict['weight'] = str(topic[1])
        s = str(lda_model.print_topic(topic[0], 30))
        freq_word = s.split(" + ")
        for j in range(0,len(freq_word)):
            fw = freq_word[j].split("*")
            if 'words' in dict:
                if str(fw[1]) == '"\ud83d"':
                    continue
                dict['words'].append({'name':fw[1], 'freq':fw[0]})
            else:
                if str(fw[1]) == '"\ud83d"':
                    continue
                dict['words'] = [{'name':fw[1], 'freq':fw[0]}]
        idx += 1
        print(dict)
        dd.append(dict)
    result = perdoc.insert_many(dd)
    #print(result)
#print(db.perdoc.count())

#{pid:“待查询文章id”, sid:“匹配文章id”, similarity:“pid和sid两篇文章相似度”}
#每篇文章的相似列表
sim = db.sim

# 用bag_of_words_corpus作为特征，训练tf_idf_model
tf_idf_model = gensim.models.TfidfModel(bag_of_words_corpus)

# 每篇文章在vsm上的tf-idf表示
corpus_tfidf = tf_idf_model[bag_of_words_corpus]
        

for i in range(0,len(df)):
    print("相似权重矩阵：")
    similarity(i, str(df.con_cutted[i]), word_count_dict, corpus_tfidf )