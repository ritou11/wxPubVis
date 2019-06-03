from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import pandas as pd
import jieba
from sklearn.metrics.pairwise import linear_kernel


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


#连接数据库
conn = MongoClient("mongodb://127.0.0.1:27017")
db = conn.wechat_spider


pstcol = db.posts
prfcol = db.profiles
pstcursor = pstcol.find(no_cursor_timeout=True)
prfcursor = prfcol.find(no_cursor_timeout=True)


pid = []
pubname = []
tit = []
dig = []
con = []
readNum = []

for i, s in enumerate(pstcursor):
	if 'content' in s:
		'''
		for _, t in enumerate(prfcursor):
			if s['msgBiz'] == t['msgBiz']:
				pubname.append(str(t['title']))
		'''
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

tfidf = TfidfVectorizer().fit_transform(df["con_cutted"])

#print(tfidf)#tuple类型

for i in range(0,len(df)):
	print(f'文章{i+1}')
	cosine_similarities = linear_kernel(tfidf[i], tfidf).flatten()
	related_docs_indices = cosine_similarities.argsort()[:-11:-1]#取前四个相似文章
	print(related_docs_indices)#相似文章索引 array
	print(cosine_similarities[related_docs_indices])#相似文章相似度 array
