
function getButtonAction(btn)
{
	return localStorage[btn] || btn;
}

function getMaxWidth()
{
	return localStorage['maxWidth'] || 30;
}

function getMaxWidthMesure()
{
	return localStorage['maxWidthMesure'] || 'em';
}

function isBookmarkHidden(title, useGoogleBookmarks)
{
	return localStorage[(useGoogleBookmarks ? 'g_' : '') + 'bookmark_' + title] == 'true';
}

function isSwitchToNewTab()
{
	return localStorage['switchToNewTab'] == 'true';
}

function getWindowMaxWidth()
{
	var maxWidth = localStorage['winMaxWidth'];
	return maxWidth == undefined ? 800 : parseInt(maxWidth);
}

function getWindowMaxHeight()
{
	var maxHeight = localStorage['winMaxHeight'];
	return maxHeight == undefined ? 600 : parseInt(maxHeight);
}

function getFontFamily()
{
	return localStorage['fontFamily'] || 'Verdana';
}

function getFontSize()
{
	return localStorage['fontSize'] || 13;
}

function getFavIconWidth()
{
	return localStorage['favIconWidth'] || 16;
}

function isShowTooltip()
{
	return localStorage['showTooltip'] == 'true';
}

function isShowURL()
{
	return localStorage['showURL'] == 'true';
}

function getColor(name)
{
	var color = localStorage[name];
	return color ? color
		: name == 'bodyClr' || name == 'bmBgClr' || name == 'activeBmFntClr' ? 'FFF'
		: name == 'fntClr' ? '000'
		: name == 'activeBmBgClrFrom' ? '86ABD9'
		: name == 'activeBmBgClrTo' ? '1F5EAB'
		: 'BEBEBE'; // disabledItemFntClr
}

function getScrollBarWidth()
{
	return localStorage['scrollBarWidth'] || '7';
}

function isUseGoogleBookmarks()
{
	return localStorage['useGoogleBookmarks'] == 'true';
}

function getLabelSeparator()
{
	return localStorage['labelSeparator'] || '>';
}

function getFaviconServiceForChrome()
{
	var service = localStorage['chbFaviconService'];
	return service == undefined ? 1 : service;
}

function getFaviconServiceForGoogle()
{
	return localStorage['gbFaviconService'] || 2;
}

function isHideCMModeSwitcher()
{
	return localStorage['hideCMModeSwitcher'] == 'true';
}

function isHideCMOpenIncognito()
{
	return localStorage['hideCMOpenIncognito'] == 'true';
}
