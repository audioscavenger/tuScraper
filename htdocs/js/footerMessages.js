// version = 1.0
/*
footerMessages outputs sliding messages in a bootstrap 4 footer

footerMessages html needs:

<style>
footer >.container {
  margin-left: 2rem;
}
.message {
  left: 100%;
  cursor: pointer;
}
</style>

<footer class="footer mt-auto fixed-bottom"><div class="container">
<div id="alert-output" class="row">
</div>
</div></footer>

*/


// https://stackoverflow.com/questions/12888584/is-there-a-way-to-tell-chrome-web-debugger-to-show-the-current-mouse-position-in
var x, y; document.onmousemove=(e)=>{x=e.pageX;y=e.pageY;}
// live expression:  "("+x+", "+y+")"

var inc = 0;
function messageTest() {
  inc++;
  return "aaaaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbbbbbbbbb"+inc;
}

$('#testMessageButton').click(function() {
  outputMessage(messageTest(), "info");
});

function getChildrenWidth(container="#alert-output") {
var ofw=0, ouw=0;
  $(container+' .active').each(function () {
    ofw += this.offsetWidth;
    ouw += $(this).outerWidth(); 
    // change to .outerWidth(true) if you want to calculate margin too.
    // console.log('ofw/ouw='+ofw+'/'+ouw);
  });
  return ofw;
}

function outputMessage(message, alert="info") {
  if (debug) console.log('outputMessage-'+alert+': '+message);
  var outputInnerWidth, totalStackWidth;
  outputInnerWidth = $('#alert-output').innerWidth();
  if (debug) console.log('outputInnerWidth='+outputInnerWidth);

  var newStack = createTag('span', null, "message active alert alert-"+alert, message, outputBar);
  totalStackWidth = getChildrenWidth('#alert-output');
  if (debug) console.log('totalStackWidth='+totalStackWidth);
  
  while (totalStackWidth > outputInnerWidth) {
    hideMessage($('#alert-output .active').first());
    totalStackWidth = getChildrenWidth('#alert-output');
    if (debug) console.log('totalStackWidth='+totalStackWidth);
  }

  $(newStack).stop().animate({left: 0}, 600, "easeOutBounce");

}

function hideMessage(theMessage) {
  theMessage.stop().animate({marginLeft: -theMessage.outerWidth()}, 300).switchClass('active', 'inactive'); 
}

// https://api.jqueryui.com/easings/
// http://api.jquery.com/hide/
// hide message event listener for container:
$('#alert-output').on('click', '.active', function () {
  // hide animation is just crappy
  //$(this).stop().hide(600);
  // this will make elements totally disapear:
  //$(this).stop().animate({marginLeft: -($(this).outerWidth()+$(this).offset().left)}, 600).toggleClass('active');
  // this will make elements partially disapear (minus the parent margin-left + padding-left):
  hideMessage($(this)); 
});

// Note: The "hover" event has been deprecated
// pop-up last hidden message event listener:
$('#alert-output').on({
  mouseenter: function () {
    $(this).stop().animate({marginLeft: -41}, 300);
  },

  mouseleave: function () {
    $(this).stop().animate({marginLeft: -$(this).outerWidth()}, 600);
  }
}, '.inactive');

