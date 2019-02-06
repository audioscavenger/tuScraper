// version = 2.0
/*
I think this originates from https://kriesi.at/archives/create-simple-tooltips-with-css-and-jquery-part-2-smart-tooltips

1) this tooltip function works with any element with the class "tip" AND the attribute tooltip="img url"
	it will show a tooltip with the content of the url, within a div with "tooltip" class and id="tooltipX"
2) OR, defining anywhere else, some div with "hiddenTooltip" class and an "id" that you can call later in the "tooltip" attribute (tooltip="ID")
	that allow you to have more complex content inside your tooltips, such as images, html, anything you like
http://coding.smashingmagazine.com/2007/06/12/tooltips-scripts-ajax-javascript-css-dhtml/
1.2:  now we call hiddenTooltip divs with id="tooltip-id"
      formatCrHtml for html carriage returns
2.0:  simplified functions and tooltip id names
2.1:  re-enabled isUrlValid(tooltipRef)
2.2:  enable https://duckduckgo.com/api for tooltipRef in createHiddenTooltips

TODO:
- [x] autovalidate isUrlValid(tooltipRef) url for either img, canvas, text, etc

*/

// 2.0: function formatCrHtml doesn;t seem to be needed anymore
function formatCrHtml(str) {
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br />' +'$2');
}

function isMobile() {
  return window.matchMedia("only screen and (max-width: 760px)").matches;
}

// 2.0: function attachTooltip(elm, tooltipId, tootipContent=null) attaches tooltipId to elm if exist, creates them otherwise
function attachTooltip(elm, tooltipId, tootipContent=null) {
  // console.log('attachTooltip: '+tooltipId+'='+tootipContent);
  // $("body").append('<div class="tooltip" id="'+tooltipId+'"><p>'+formatCrHtml(tootipContent)+'</p></div>');
  
  // console.log('tooltip: appended  '+tooltipId);
  //THEN give the tooltip div an id and a content; if given before it just doesn't work
  var my_tooltip = (tootipContent) ? createHiddenTooltip(tooltipId, tootipContent) : $("#"+tooltipId);
  // var my_tooltip = (tootipContent) ? createHiddenTooltip(tooltipId, tootipContent) : document.getElementById(tooltipId);   // see why this doesn't work
  // console.log('my_tooltip='+my_tooltip);
  // console.log(my_tooltip);
  $(elm).removeAttr("tooltip").on('mouseover touchstart', function(event) {
    // my_tooltip.css({opacity:0.8, display:"none"}).fadeIn(400);   // why display:"none" here?
    my_tooltip.css({opacity:0.8}).fadeIn(400);
    // my_tooltip.css({opacity:0.8}).fadeIn(400);
  }).mousemove(function(kmouse){
    var border_top = $(document).scrollTop();
    var border_right = $(window).width();
    var left_pos;
    var top_pos;
    var offset = 15;
    if (border_right - (offset *2) >= my_tooltip.width() + kmouse.pageX){
      left_pos = kmouse.pageX+offset;
    } else {
      left_pos = border_right-my_tooltip.width()-offset;
    }

    // console.log('border_top='+border_top+' kmouse.pageY='+kmouse.pageY+'  tooltip.height()='+ my_tooltip.height());
    if (border_top + (offset *2)>= kmouse.pageY - my_tooltip.height()){
      // below cursor
      top_pos = kmouse.pageY +offset;
    } else {
      // above cursor
      top_pos = kmouse.pageY-my_tooltip.height()-offset;
    }
    my_tooltip.css({left:left_pos, top:top_pos});
  }).on('mouseout', function(event) {
    my_tooltip.css({left:"-9999px"});     // this looks like much faster than display:"none"
    // my_tooltip.css({display:"none"});  // for some reason, hovering multiple elelemnts raises a bug: they dont't disappear
  }).on('touchend', function(event) {
    delay(function(){
    my_tooltip.css({left:"-9999px"});     // this looks like much faster than display:"none"
    // my_tooltip.css({display:"none"});  // for some reason, hovering multiple elelemnts raises a bug: they dont't disappear
    event.stopPropagation();
    event.preventDefault();
    }, 1000 ); // end delay
  });
}

var delay = ( function() {
    var timer = 0;
    return function(callback, ms) {
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();

/* function createHiddenTooltips generate div.hiddenTooltip for each element with either:
  - class=jQueryString (usually .tip; warning though this class also adds cursor: help)
  - or attribute toolitp="tooltipRef"
  - or both, or more
* dict = {tooltipRef:tooltipContent}
* jQueryStringThatApply can be string or array or attributes, id, className, etc: whatever identifies elements that need tooltip
* tooltipRef=$(this)attr('tooltip') or $(this)id with class=jQueryString
* tooltipId="tooltip-tooltipRef"
=> creates hidden tooltips only for elements identified with both jQueryString + dict[tooltipRef] exists
=> if tooltipId already exist, just attach it to identified element
=> if isUrlValid(dict[tooltipRef]), tooltip content becomes an img
*/
function createHiddenTooltips(dict, jQueryStringThatApply=['[tooltip]']) {
  // this modifies existing elements only:
  // if (window.matchMedia("only screen and (max-width: 760px)").matches) $( ".tooltip" ).css( 'width', '200px');
  // this adds a style for the body, better:
  if (isMobile()) $("<style type='text/css'> .tooltip{ width:200px;} </style>").appendTo("body");
  
  // mobile detection: small width + fadeOut after 2 seconds
  var tootipContent, tooltipId, tooltip;
  jQueryStringArray = (Array.isArray(jQueryStringThatApply)) ? jQueryStringThatApply : Array.of(jQueryStringThatApply);
  // console.log(jQueryStringArray);
  jQueryStringArray.forEach(function(jQueryString) {
    // console.log(jQueryString);
    $(jQueryString).each(function() {
      var tooltipRef = ($(this).attr('tooltip') !== "" ) ? $(this).attr('tooltip') : $(this).id;
      if (dict.hasOwnProperty(tooltipRef)) {
        tooltipId = "tooltip-"+tooltipRef;
        if (isUrlValid(dict[tooltipRef]) ) {
          if(dict[tooltipRef].includes('duckduckgo.com')) {
            // https://duckduckgo.com/api
            // https://api.duckduckgo.com/?q=Towson%20University&format=json
            // https://api.duckduckgo.com/?q=Towson%20University&format=json&pretty=1&no_html=1&skip_disambig=1
            // https://api.duckduckgo.com/?q=Towson+University&ia=web
            // TODO: generate delayed content for tooltip but attach it anyway
            // tootipContent = createAboutFromDuckduckgo(dict[tooltipRef], tooltipId);   // not possible with async functions
            createAboutFromDuckduckgo(dict[tooltipRef], tooltipId);
          } else {
            tootipContent = document.createElement('img');
            tootipContent.src = dict[tooltipRef];
          }
        } else {
          tootipContent = dict[tooltipRef];
        }
        // in any case, (create) and attache a tooltip to $(this); createAboutFromDuckduckgo will fill it in later
        tooltip = (document.getElementById(tooltipId) !== null) ? document.getElementById(tooltipId) : createHiddenTooltip(tooltipId, tootipContent);
        attachTooltip($(this), tooltipId);
      }
    });
  });

  // console.log('-------createHiddenTooltips-document.body:------');
  // console.log(document.body);
  // console.log('-----------------------------------------------');
}

function createHiddenTooltip(tooltipId, tootipContent='') {
  // var tooltip = createTag('div', tooltipId, "tooltip hiddenTooltip");
  // createTag('p', '', '', tootipContent, tooltip);
  // return tooltip;
  var p = createTag('p', '', '', tootipContent, tooltipId);
  return createTag('div', tooltipId, "tooltip hiddenTooltip", p);
}

function createAboutFromDuckduckgo(url, tooltipId) {
  /* getJsonAsync fails miserably without proxy on */
  // getJsonAsync(url, convertDuckduckgoJsonToHtml, true);
  // /* getJsonFromUrlAsync returns Ghostery data without proxy on */
  getJsonFromUrlAsync(url, convertDuckduckgoJsonToHtml, true, tooltipId);
}

function convertDuckduckgoJsonToHtml(jsonDuckduckgo, tooltipId) {
  // thanks to getJsonFromUrlAsync, the callback function gets all optional arguments passed in one array:
  var tooltipBody = document.createElement('div');
  var img = createTag('img', '', '', '', tooltipBody);
    img.src = jsonDuckduckgo['Image'];
    img.style.width = '200px';
  var h3 = createTag('h3', '', '', jsonDuckduckgo['Heading'], tooltipBody);
  var Abstract = createTag('div', '', '', '', tooltipBody);
    var AbstractText = createTag('span', '', '', jsonDuckduckgo['AbstractText'], Abstract);
  var tooltip = createHiddenTooltip(tooltipId[0], tooltipBody);
  // console.log(tooltip);
  // console.log(document.body);
}





// this should be called once the hiddenTooltip have been generated
// $(document).ready(function(){
    // createHiddenTooltips(sqlDict, '.tip');      // attach tooltipId="tooltip-tooltipRef" only to elements with class .tip; tooltipRef=elementID unless attribute tooltip exists
    // createHiddenTooltips(sqlDict, '[tooltip]'); // attach tooltipId="tooltip-tooltipRef" only to elements with attribute tooltip="tooltipRef" -> 
    // createHiddenTooltips(sqlDict, ['[tooltip]', '.tip']); // attach tooltipId="tooltip-tooltipRef" only to elements with attribute tooltip="tooltipRef" -> 
// });
