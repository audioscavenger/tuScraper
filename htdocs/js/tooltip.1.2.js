// version = 1.2
/*
1) this tooltip function works with any element with the class "tip" AND the attribute tooltip="img url"
	it will show a tooltip with the content of the url, within a div with "tooltip" class and id="tooltipX"
2) OR, defining anywhere else, some div with "hiddenTooltip" class and an "id" that you can call later in the "tooltip" attribute (tooltip="ID")
	that allow you to have more complex content inside your tooltips, such as images, html, anything you like
http://coding.smashingmagazine.com/2007/06/12/tooltips-scripts-ajax-javascript-css-dhtml/
1.2:  now we call hiddenTooltip divs with id="tooltip-id"
      formatCrHtml for html carriage returns
*/

function formatCrHtml(str) {
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br />' +'$2');
}

function simple_tooltip(target_items, name){
  $(target_items).each(function(i){
    var tootipContent;
    //if "tooltip" attribute is set
    if ($(this).attr("tooltip") !== "" ){
      // console.log("tooltip: processing tooltip="+$(this).attr('tooltip'));
      var tooltipRef = $(this).attr('tooltip');
      if (isUrlValid(tooltipRef) === true) {
        //a valid url has been detected as the tooltip, it *SHOULD* be of an image...
        tootipContent = '<img src="'+tooltipRef+'">';
      } else {
        //for all other cases, we set the tooltipRef to the tooltip attibute
        // console.log('tooltip: tooltipRef='+tooltipRef);
        //then we build a list of all div with "hiddenTooltip" class
        var divList = document.querySelectorAll(".hiddenTooltip");
        //then for each existing hidden preset tooltips we check...
        for (var j = 0, length = divList.length; j < length; j++) {
          //... if a preset hidden tooltip id does fits the tooltip tooltipRef
          if ('tooltip-'+tooltipRef == divList[j].id ){
            //... then build the tooltip div with hidden corresponding tooltip content
            tootipContent = divList[j].innerHTML;
            // console.log('tooltip: tootipContent='+tootipContent);
            break;
          }
        }
      }
      if (tootipContent) {
        // console.log('tooltip: appending '+name+i);
        $("body").append("<div class='"+name+"' id='"+name+i+"'><p>"+formatCrHtml(tootipContent)+"</p></div>");
        // console.log('tooltip: appended  '+name+i);
        //THEN give the tooltip div an id and a content; if given before it just doesn't work
        var my_tooltip = $("#"+name+i);
        $(this).removeAttr("tooltip").mouseover(function(){
          my_tooltip.css({opacity:0.8, display:"none"}).fadeIn(400);
          // console.log('tooltip: mouseover:fadeIn');
        }).mousemove(function(kmouse){
          var border_top = $(window).scrollTop;
          // console.log('tooltip: border_top='+border_top);
          var border_right = $(window).width();
          // console.log('tooltip: border_right='+border_right);
          var left_pos;
          var top_pos;
          var offset = 15;
          if (border_right - (offset *2) >= my_tooltip.width() + kmouse.pageX){
            left_pos = kmouse.pageX+offset;
          } else {
            left_pos = border_right-my_tooltip.width()-offset;
          }

          if (border_top + (offset *2)>= kmouse.pageY - my_tooltip.height()){
            top_pos = border_top +offset;
          } else {
            top_pos = kmouse.pageY-my_tooltip.height()-offset;
          }
          my_tooltip.css({left:left_pos, top:top_pos});
        }).mouseout(function(){
          my_tooltip.css({left:"-9999px"});
          // console.log('tooltip: mouseout:-9999px');
        });
      }
    }
  });
}

// this should be called once the hiddenTooltip have been generated
// $(document).ready(function(){
  // simple_tooltip(".tip","tooltip");
// });
