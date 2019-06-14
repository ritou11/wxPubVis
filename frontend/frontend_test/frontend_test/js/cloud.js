var DATA_FILE_PATH = '../data/test1.json';
var TARGET_ELEMENT_ID = '#cloud';

d3.json(DATA_FILE_PATH).then(function (data) { // v5
	console.log(data);
	var h = 500;
	var w = 800;

	var random = d3.randomIrwinHall(2);
	var countMax = d3.max(data, function (d) {
		return d.freq
	});
	var sizeScale = d3.scaleLinear().domain([0, countMax]).range([10, 100])

	var words = data.map(function (d) {
		return {
			text: d.name.replace(/\"/g,''),
			size: sizeScale(d.freq)
		};
		
		
	});
	console.log(Object.values(words));
	
	d3.layout.cloud().size([w, h])
		.words(words)
		.rotate(0)
//		.font("Impact")
		.fontSize(function (d) {
			return d.size;
		})
		.on("end", draw)
		.start();

	function draw(words) {
		d3.select(TARGET_ELEMENT_ID)
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
			.selectAll("text")
			.data(words)
			.enter().append("text")
			.style("font-size", function (d) {
				return d.size + "px";
			})
			.style("font-weight", "400")
			.style("font-family", "Roboto", "Helvetica", "Arial", "sans-serif")
			.style("fill", function (d, i) {
				return d3.schemeCategory10[i % 10];
			})
			.attr("text-anchor", "middle")
			.attr("transform", function (d) {
				return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
			})
			.text(function (d) {
				return d.text;
			});
	}

});
//
//$('ul.tabs li').on('click', function(){
//	console.log("ha");
//	DATA_FILE_PATH = '../data/test.json';
//	updateData();
//});
//
//function updateData() {
//d3.json(DATA_FILE_PATH).then(function (data) { // v5
//	console.log(data);
//	var h = 500;
//	var w = 800;
//
//	var random = d3.randomIrwinHall(2);
//	var countMax = d3.max(data, function (d) {
//		return d.freq
//	});
//	var sizeScale = d3.scaleLinear().domain([0, countMax]).range([10, 100])
//
//	var words = data.map(function (d) {
//		return {
//			text: d.name,
//			size: sizeScale(d.freq)
//		};
//		
//		
//	});
//	console.log(Object.values(words));
//	
//	d3.layout.cloud().size([w, h])
//		.words(words)
//		.rotate(0)
////		.font("Impact")
//		.fontSize(function (d) {
//			return d.size;
//		})
//		.on("end", draw)
//		.start();
//
//	function draw(words) {
//		d3.select(TARGET_ELEMENT_ID)
//			.append("svg")
//			.attr("width", w)
//			.attr("height", h)
//			.append("g")
//			.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
//			.selectAll("text")
//			.data(words)
//			.enter().append("text")
//			.style("font-size", function (d) {
//				return d.size + "px";
//			})
//			.style("font-weight", "400")
//			.style("font-family", "Roboto", "Helvetica", "Arial", "sans-serif")
//			.style("fill", function (d, i) {
//				return d3.schemeCategory10[i % 10];
//			})
//			.attr("text-anchor", "middle")
//			.attr("transform", function (d) {
//				return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
//			})
//			.text(function (d) {
//				return d.text;
//			});
//	}
//
//});
//}