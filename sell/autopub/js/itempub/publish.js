/**
 * 发布页面SKU(itempub/sku)
 * 图片上传(itempub/upload)
 */
KISSY.add(function(S) {
	var args = S.makeArray(arguments);
	S.ready(function() {
		for (var i = 1; i < args.length; i++) {
			var module = args[i] || {};
			module.init && module.init();
		}
	});
}, {requires:[
	'itempub/upload/imgspace.css',
	'itempub/upload/itempic.css',
	'itempub/upload/uploadspace.css',
	'itempub/sku/sku.css',
	'itempub/upload/itempic',
	'itempub/sku'
	]}
);
