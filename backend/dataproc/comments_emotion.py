# 计算每个评论的情感
# 输入：评论content
# 输出：评论情感senti，取值0-1，表示"该评论为积极"的置信度
from snownlp import SnowNLP
from pymongo import MongoClient

conn = MongoClient('localhost', 27017)
db = conn.wechat_spider
cmtcol = db.comments

projection = {"_id": 1, "content": 1, "senti": 1}

cursor = cmtcol.find(projection=projection, no_cursor_timeout=True)
for i, doc in enumerate(cursor):
    if (i % 100 == 0):
        print(f'\r{i}', end='', flush=True)
    if 'content' in doc.keys() and 'senti' not in doc.keys():
        senti = SnowNLP(doc['content']).sentiments
        cmtcol.update_one({'_id': doc['_id']}, {'$set': {'senti': senti}})
cursor.close()
