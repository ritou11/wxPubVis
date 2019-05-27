# 计算公众号的活跃度
# 输入：公众号的各个推送
# 输出：公众号活跃度 ~ 时间
# 定义：活跃度 = \sum_{p\in\text{Posts}}(R_p + 50 L_p) / \sqrt{C(\text{Posts})}
from snownlp import SnowNLP
from pymongo import MongoClient
import math
from functools import reduce

conn = MongoClient('localhost', 27017)
db = conn.wechat_spider
procol = db.profiles
pstcol = db.posts
cmtcol = db.comments

projection = { '_id': 1, 'msgBiz': 1 }
procur = procol.find(projection=projection, no_cursor_timeout=True)
totalPro = procol.count_documents({})

for i, pro in enumerate(procur):
    n = 0
    if 'msgBiz' not in pro.keys():
        continue
    pstcur = pstcol.find({ 'msgBiz': pro['msgBiz'] },
                        projection={ 'readNum': 1, 'likeNum': 1, 'publishAt': 1 },
                        no_cursor_timeout=True)
    totalPst = pstcol.count_documents({ 'msgBiz': pro['msgBiz'] })
    data = dict()

    for j, pst in enumerate(pstcur):
        if (j % 10 == 0):
            print(f'\rProfile:{i + 1}/{totalPro} Post:{j + 1}/{totalPst}', end='', flush=True)
        if 'readNum' not in pst.keys() or 'publishAt' not in pst.keys():
            continue
        likeNum = pst['likeNum'] if 'likeNum' in pst.keys() else 0
        if pst['publishAt'] not in data.keys():
            data[pst['publishAt']] = [ { 'readNum': pst['readNum'], 'likeNum': likeNum } ]
        else:
            data[pst['publishAt']].append({ 'readNum': pst['readNum'], 'likeNum': likeNum })
    pstcur.close()

    activity = list()
    for k in data.keys():
        n = len(data[k])
        res = reduce(lambda x,y : { 'readNum': x['readNum'] + y['readNum'], 'likeNum': x['likeNum'] + y['likeNum'] },data[k])
        score = (res['readNum'] + 50 * res['likeNum']) / math.sqrt(n)
        activity.append({ 'publishAt': k, 'score': score })

    procol.update_one({ '_id': pro['_id'] }, { '$set': { 'activity': activity } })

procur.close()
