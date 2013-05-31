## 模块划分

### detail页

#### 天猫公共吊顶、头部、页尾：
* 公共模块，`采用哪个版本的头部？该模块是vm渲染还是异步获取？`

#### 顶部商家信息模块：
* 公共模块，`vm渲染还是异步获取？样式？`

#### 其他自定义模块：
* 商家自定义模块，`如何引入？`

#### 商品信息模块：
* 自定义展示性模块，游戏名称、运营商、游戏类型、收费属性

#### 区服选择模块：
* 自定义展示性模块，推荐区服、新服开启、区服列表。
* js逻辑——更多区服展示和隐藏

#### 商品详情tab模块：
* tabs间切换，tabs导航支持随页面滚动功能
* js逻辑——tabs间切换可基于switchable组件，tabs随页面滚动基于fixedbar组件，`各个tab的列表内容是否在后端做首次渲染？`

#### 游戏介绍模块：
* 自定义展示性模块，游戏描述内容，游戏图片的展示

#### 游戏攻略模块：
* 自定义展示性模块，游戏攻略列表，`是否需要分页？`
* js逻辑——pagination组件

#### 新手卡模块：
* 自定义展示性模块，新手卡相关信息展示，支持领取和复制功能，`是否需要分页？支持分区服的新手卡查询，查询条件是根据区服选择的值来，还是在新手卡tab提供搜索入口？`
* js逻辑——pagination组件，领取接口，激活码复制组件

#### 游戏充值模块：
* 自定义展示性模块，`是否需要分页？`
* js逻辑——pagination组件

### 后台管理页
* 图片上传组件
* 校验组件
* 富文本编辑组件
* 文件上传组件

## 接口定义

### 获取游戏攻略列表接口
* request：游戏id、页数
* response：状态码、状态信息、总页数、攻略列表（type, name, link, lastModify）
* issue：暂无

### 获取新手卡列表接口
* request：游戏id、页数、区服id
* response：状态码、状态信息、总页数、新手卡列表（cardId, img, description, title, content, usage, getCount, deadline, scope）
* issue：如果用户已登录，并且领取过卡片，则返回的新手卡信息还应包括激活码。

### 领取新手卡接口
* request：新手卡id
* response：状态码、状态信息、激活码
* issue：此接口应检查用户登录状态

### 获取游戏充值卡列表接口
* request：游戏id、页数
* response：状态码、状态信息、总页数、充值卡列表（img, description, price, promotionPrice, link）
* issue：暂无


## 店铺规范

### 相关文档
淘宝的店铺规范参见[http://fed.ued.taobao.net/shop-team/specification/build/html/frontend/index.html](http://fed.ued.taobao.net/shop-team/specification/build/html/frontend/index.html)

### 页面结构
按照店铺规范，结合现有的天猫detail页，游戏detail页可能的页面结构如下:

	<!DOCTYPE HTML>
	<!--[if lt IE 7]><html class="no-js ie ie6 lte9 lte8 lte7"> <![endif]-->
	<!--[if IE 7]><html class="no-js ie ie7 lte9 lte8 lte7"> <![endif]-->
	<!--[if IE 8]><html class="no-js ie ie8 lte9 lte8"> <![endif]-->
	<!--[if IE 9]><html class="no-js ie ie9 lte9"> <![endif]-->
	<!--[if gt IE 9]><html class="no-js"><![endif]-->
	<!--[if !IE]><!--><html><!--<![endif]-->
	<head>
		<meta charset="gbk">
		<title></title>
	</head>
	<body>
		<div id="site-nav"> 
			<!-- 系统吊顶-->
			<!--#include virtual="../mods/tmall-global-top.html" -->
		</div>
		<div id="header"> 
			<!-- 系统页头 --> 
			<!--#include virtual="../mods/tmall-global-header.html" -->
		</div>
		<div id="page">
			<div id="content">
				<div id="hd"> 
					<!-- 店铺页头 -->
					<!--#include virtual="../mods/shop-header.html" -->
				</div>
				<div id="detail">
					<!-- 商品信息 -->
					<div class="gm-detail-bd">
						<div class="gm-summary">
							<div class="gm-property">
								<!-- 游戏商品信息和区服展示 -->
								<!--#include virtual="../mods/shop-property.html" -->
							</div>
							<div class="gm-gallery">
								<!-- 游戏商品图片 -->
								<!--#include virtual="../mods/shop-gallery.html" -->
							</div>
						</div>
					</div>
				</div>
				<div id="bd"> 
					<!-- 店铺内容，包含布局和模块 -->
					<div class="layout grid-s5m0">
						<div class="col-main">
							<div class="main-wrap">
								<!-- 游戏商品详情、攻略、新手卡、充值 -->
								<!--#include virtual="../mods/shop-detail.html" -->
							</div>
						</div>
						<div class="col-sub"></div>
					</div>
				</div>
				<div id="ft"> <!-- 店铺页尾 --> </div>
			</div>
			<div id="footer">
				<!-- 系统页尾 --> 
				<!--#include virtual="../mods/tmall-global-footer.html" -->
			</div>
		</div>
	</body>
	</html>

### 一些约定
* detail页使用天猫店铺的公共吊顶和页脚，页面框架和公共模块的样式文件直接引用天猫标准路径下的文件，不在本地保留样式副本再引用，避免更改公共样式
* detail页的项目内部模块避免给dom元素加id，避免与页面其他模块发生id冲突
* detail页的项目内部模块元素的class名以“gm-”为前缀
* `detail页的自定义模块是否需要按照淘宝店铺规范作包裹？`见[http://fed.ued.taobao.net/shop-team/specification/build/html/frontend/module/written/html.html](http://fed.ued.taobao.net/shop-team/specification/build/html/frontend/module/written/html.html)
* 对于商家自定义模块的样式文件，系统会自动加上.tb-shop的类名前缀，需确保引入的自定义模块包裹在tb-shop类名的命名空间下
