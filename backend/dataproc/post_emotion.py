# 计算每每篇推送的评论情感
# 输入：对应评论的senti
# 输出：推送评论情感comSenti
from snownlp import SnowNLP
from pymongo import MongoClient

conn = MongoClient('localhost', 27017)
db = conn.wechat_spider
pstcol = db.posts
cmtcol = db.comments

projection = {'_id': 1}
cursor = pstcol.find(projection=projection, no_cursor_timeout=True)
for i, doc in enumerate(cursor):
    if (i % 10 == 0):
        print(f'\r{i}', end='', flush=True)
    if 'comSenti' in doc.keys():
        continue
    sumTotal = 0
    sumSenti = 0
    for cmt in cmtcol.find({'postId': doc['_id']}, projection={'likeNum': 1, 'senti': 1}):
        if 'senti' not in cmt.keys():
            continue
        like = cmt['likeNum'] if 'likeNum' in cmt.keys() else 0
        senti = cmt['senti']
        sumTotal += like + 1
        sumSenti += senti * (like + 1)
    if sumTotal == 0:
        continue
    comSenti = sumSenti / sumTotal
    pstcol.update_one({'_id': doc['_id']}, {'$set': {'comSenti': comSenti}})

cursor.close()
