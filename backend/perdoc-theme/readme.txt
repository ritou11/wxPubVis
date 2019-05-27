1.The format of posts.csv:(extract from posts.json)
	"pid":pid,
	"pubname":pubname,
	"title":tit,
	"digest":dig,
	"content":con,
	"readNum":readNum

2.perdoc-topics.ipynb: you may need change the data path and the name of the database.

3.run the block of perdoc-topics.ipynb one by one

4.The format of stored data:
	word cloud: {pid:pid, theme: "主题1", words: [{name:"xxx", freq:123}], weight}
	similar document: {pid: the selected document, sid: the matched document, similarity: 	the similarity between pid and sid}