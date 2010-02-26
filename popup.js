
// vim:noet ts=4 sw=4

var selectedBookmark = undefined;

var winMaxWidth = getWindowMaxWidth();
var winMaxHeight = getWindowMaxHeight();

function isFolderURL(url)
{
	return url == 'folder:';
}

function openInNewTab(anchor)
{
	chrome.tabs.create({ url: anchor.href, selected: isSwitchToNewTab() });
	window.close();
}

function openInCurrentTab(anchor)
{
	var url = anchor.href;
	if(isJsURL(url))
	{
		chrome.tabs.executeScript(null, { 'code': unescape(url.substr(11)) });
		window.close();
	}
	else
	{
		chrome.tabs.getSelected(null, function(tab)
		{
			chrome.tabs.update(tab.id, { 'url': url });
			window.close();
		});
	}
}

function openLink(ev)
{
	var action = parseInt(getButtonAction(ev.button));
	switch(action)
	{
		case 0: // open in current tab
		{
			if(!isFolderURL(this.href))
				ev.ctrlKey ?  openInNewTab(this) : openInCurrentTab(this);
			break;
		}
		case 1: // open in new tab
		{
			if(!isFolderURL(this.href))
				openInNewTab(this);
			break;
		}
		case 2: // open pop up menu
		{
			selectedBookmark = this;
			var selected = this.parentNode;
			while(true)
			{
				selected.setAttribute('class', 'selected');
				selected = selected.parentNode.parentNode;
				if(selected.tagName != 'LI')
				{
					break;
				}
			}
			var body = document.body;

			var popupMenu = document.getElementById('popupMenu');
			var popupMenuStyle = popupMenu.style;
			popupMenuStyle.display = 'block';

			var bodyWidth = body.clientWidth;

			if(ev.clientX + popupMenu.clientWidth > body.clientWidth)
			{
				if(popupMenu.clientWidth > body.clientWidth)
				{
					bodyWidth = popupMenu.clientWidth + 7;
					body.style.width = bodyWidth + 'px';
				}
				popupMenuStyle.left = bodyWidth - popupMenu.clientWidth - 5 + 'px';
			}
			else
			{
				popupMenuStyle.left = ev.clientX + 'px';
			}

			var bodyHeight = body.scrollHeight;
			if(ev.clientY + popupMenu.clientHeight > body.clientHeight)
			{
				if(popupMenu.clientHeight > body.clientHeight)
				{
					bodyHeight = ev.clientY + popupMenu.clientHeight + 5;
					body.style.height = bodyHeight + 'px';
					popupMenuStyle.top = ev.clientY + 'px';
				}
				else
				{
					popupMenuStyle.top = ev.clientY + body.scrollTop - popupMenu.clientHeight + 'px';
				}
			}
			else
			{
				popupMenuStyle.top = ev.clientY + body.scrollTop + 'px';
			}

			var transparentLayerStyle = document.getElementById('transparentLayer').style;
			transparentLayerStyle.width = bodyWidth - 2 + 'px';
			transparentLayerStyle.height = bodyHeight - 2 + 'px';
			transparentLayerStyle.display = 'block';
			break;
		}
	}
}
function unSelect()
{
	if(selectedBookmark != undefined)
	{
		var selected = selectedBookmark.parentNode;
		while(true)
		{
			selected.removeAttribute('class');
			selected = selected.parentNode.parentNode;
			if(selected.tagName != 'LI')
			{
				break;
			}
		}
	}
	document.getElementById('popupMenu').style.display = 'none';
	document.getElementById('transparentLayer').style.display = 'none';
}

function openSelected(ev, newWindow)
{
	if(ev.button == 0 && selectedBookmark != undefined)
	{
		if(newWindow)
		{
			chrome.windows.create({ url: selectedBookmark.href });
			window.close();
		}
		else
		{
			openInNewTab(selectedBookmark);
		}
	}
	else
	{
		unSelect();
		selectedBookmark = undefined;
	}
}
function deleteSelected(ev)
{
	unSelect();
	if(ev.button == 0 && selectedBookmark != undefined)
	{
		chrome.bookmarks.remove(selectedBookmark.id);
		var li = selectedBookmark.parentNode;
		var ul = li.parentNode;
		ul.removeChild(li);
		if(ul.childNodes.length == 0)
		{
			addEmptyItem(ul);
			var parentLI = ul.parentNode;
			if(parentLI.tagName == 'LI')
			{
				parentLI.childNodes[0].onmouseup = openLink;
			}
		}
	}
	selectedBookmark = undefined;
}

function changeBodySize(anchor)
{
	var ul = anchor.parentNode.getElementsByTagName('ul')[0];
	var body = document.body;
	var style = body.style;

	var height = getY(anchor) + ul.clientHeight + 2;
	if(body.clientHeight < height)
	{
		style.height = (height > winMaxHeight ? winMaxHeight : height) + 'px';
	}

	var width = 0;
	var tmpUL = ul;
	while(tmpUL.parentNode.tagName != 'BODY')
	{
		tmpUL = tmpUL.parentNode.parentNode;
		width += tmpUL.clientWidth + 1;
	}
	if(width < winMaxWidth && anchor.data > 1)
	{
		var offset = (winMaxWidth - width) / anchor.data;
		if(offset < ul.clientWidth)
		{
			ul.style.left = '-' + offset + 'px';
		}
	}
	var scrollBarWidth = body.scrollHeight > body.clientHeight ? 15 : 0;
	width += ul.clientWidth + 2 + scrollBarWidth;
	if(width < winMaxWidth && body.clientWidth < width)
	{
		style.width = width + 'px';
	}
	else if(width > winMaxWidth)
	{
		style.width = winMaxWidth + 'px';
		ul.style.left = '-' + (ul.clientWidth - (width - winMaxWidth)) + 'px';
	}
}

function getY(el)
{
	var y = 0;
	while(el != null)
	{
		if(el.offsetTop > 0)
		{
			y += el.offsetTop;
		}
		el = el.offsetParent;
	}
	return y;
}

function createAnchor(node)
{
	var anchor = document.createElement('a');
	anchor.id = node.id;
	anchor.setAttribute('onclick', 'return false;');
	anchor.setAttribute('onmousedown', 'return false;');
	anchor.onmouseup = openLink;
	if(node.url == undefined)
	{
		anchor.href = "folder://";
		anchor.setAttribute('onMouseOver', "changeBodySize(this);");
		if(node.children.length > 0)
		{
			anchor.onmouseup = undefined;
		}
	}
	else
	{
		var url = node.url;
		anchor.href = url;
	}
	anchor.innerHTML = '<img class="favicon" src="' + getFavicon(node.url) + '"/>&nbsp;' + node.title;
	return anchor;
}

function addEmptyItem(ul)
{
	var li = document.createElement('li');
	li.setAttribute('class', 'empty');
	li.innerHTML = 'Empty';
	ul.appendChild(li);
}

function addChild(node, htmlNode, appendChildsToFolder)
{
	if(node.children == undefined)
	{
		var li = document.createElement('li');
		li.appendChild(createAnchor(node));
		htmlNode.appendChild(li);
	}
	else
	{
		var li = document.createElement('li');
		var anchor = createAnchor(node);
		li.appendChild(anchor);
		htmlNode.appendChild(li);
		var children = node.children;
		var len = children.length;
		var hasSubMenus = false;
		if(appendChildsToFolder)
		{
			var ul = document.createElement('ul');
			li.appendChild(ul);
			if(len > 0)
			{
				for(var i = 0; i < len; i++)
				{
					addChild(children[i], ul, appendChildsToFolder);
					if(children[i].children != undefined)
					{
						hasSubMenus = true;
					}
				}
			}
			else
			{
				addEmptyItem(ul);
			}
		}
		else
		{
			li.data = children;
		}

		if(appendChildsToFolder && !hasSubMenus)
		{
			var depth = 0;
			anchor.data = depth++;
			while(true)
			{
				if(anchor.data != undefined && anchor.data > depth)
				{
					break;
				}
				anchor.data = depth++;
				li = li.parentNode.parentNode;
				if(li.tagName != 'LI')
				{
					break;
				}
				anchor = li.childNodes[0];
			}
		}
	}
}

chrome.bookmarks.getTree(function(nodes)
{
	document.body.style.fontSize = getFontSize() + 'px';

	var styleSheet = document.styleSheets[document.styleSheets.length - 1];
	var favIconWidth = getFavIconWidth();
	styleSheet.addRule('a > img.favicon', 'width: ' + favIconWidth + 'px; height: ' + favIconWidth + 'px;');
	styleSheet.addRule('#bookmarksTree a', 'max-width: ' + getMaxWidth() + getMaxWidthMesure() + ';');

	var ul = document.createElement('ul');
	ul.setAttribute('class', 'bookmarksTree');
	ul.setAttribute('id', 'bookmarksTree');

	document.body.appendChild(ul);
	for(var i = 0, nodesLength = nodes.length; i < nodesLength; i++)
	{
		var children = nodes[i].children;
		for(var j = 0, childrenLength = children.length; j < childrenLength; j++)
		{
			var allHidden = true;
			var children2 = children[j].children;
			for(var k = 0, children2Length = children2.length; k < children2Length; k++)
			{
				if(!isBookmarkHidden(children2[k].title))
				{
					addChild(children2[k], ul);
					allHidden = false;
				}
			}
			if(j + 1 < childrenLength && !allHidden)
			{
				var li = document.createElement('li');
				li.setAttribute('class', 'separator');
				ul.appendChild(li);
			}
		}
	}

	var bodyStyle = document.body.style;
	var ulHeight = ul.clientHeight + 2;
	var scrollBarWidth = ulHeight < winMaxHeight ? 0 : 15;

	bodyStyle.width = ul.clientWidth + 2 + scrollBarWidth + 'px';
	bodyStyle.height = ulHeight < winMaxHeight ? ulHeight + 'px' : winMaxHeight + 'px';

	// run filling in background to speed up rendering top items
	setTimeout("fillTree()", 50);
});

function fillTree()
{
	var ul = document.getElementById('bookmarksTree');
	for(var i = 0, len = ul.childNodes.length; i < len; i++)
	{
		var li = ul.childNodes[i];
		if(li.data != undefined)
		{
			var children = li.data;
			var li_ul = document.createElement('ul');
			li.appendChild(li_ul);
			var len2 = children.length;
			if(len2 > 0)
			{
				for(var j = 0; j < len2; j++)
				{
					addChild(children[j], li_ul, true);
				}
			}
			else
			{
				addEmptyItem(li_ul);
			}
			li.removeAttribute('data');
		}
	}
}
