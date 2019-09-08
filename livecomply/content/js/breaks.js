$(function(){
	updateBreaks();
	setInterval(function(){updateBreaks()}, 30000);
	
	var timerEID = null;
	$('input[name="eid"]').on('input', (function(){
			$('form.form-clock')[0].classList.remove('error');
			clearTimeout(timerEID); 
			timerEID = setTimeout(eidPull, 400);
	}));
});

function updateBreaks() {
	console.log("Updating breaks...");
	var at = $('var[id="ajaxToken"]')[0].getAttribute("data-ajaxtoken");
	var si = $('var[id="sessionID"]')[0].getAttribute("data-sessionid");
	$.post("/ajax?action=updateBreaks",
			    {
			        ajax_token: at,
			        sessionID: si
			    },
			    function(data){
					var eids = [];
					document.querySelectorAll('#clocks-active li.e-selected .clock-emp .clock-item.eid').forEach(function(element){
						eids.push(element.innerHTML);
					});
			    	var ejson = JSON.parse(data);
					if(ejson[`data`]==null){
						if(ejson[`error`]!=null){
							console.log(error);
						}
						return;
					}
			        if(ejson['data']['status']=="S1") {
						document.getElementById("clocks-active").innerHTML = '';
			        	var clocks = ejson['data']['clocks'];
						clocks.forEach(function(obj) {
							var cSelected = "";
							var ee = pad(obj['eid'], 6);
							if(eids.includes(ee)){
								cSelected = " class=\"e-selected\" ";
							}
							document.getElementById("clocks-active").innerHTML = document.getElementById("clocks-active").innerHTML +
							"<li "+cSelected+"onclick=\"selectActiveClock(this)\">" +
									"<div class=\"clock-emp\">"+
										"<p class=\"clock-item eid\">"+ee+"</p>"+
										"<p class=\"clock-item ename\">"+obj['name']+"</p>"+
										"<p class=\"clock-item ecin\">"+obj['time_in']+"</p>"+
										"<div class=\"clock-item etens\">"+
											"<p class=\"blast\">"+obj['last_ten']+"</p>"+
											"<p class=\"bnext\">"+obj['next_ten']+"</p>"+
										"</div>"+
										"<div class=\"clock-item eths\">"+
											"<p class=\"blast\">"+obj['last_thirty']+"</p>"+
											"<p class=\"bnext\">"+obj['next_thirty']+"</p>"+
										"</div>"+
										"<a class=\"clock-item\" href=\"#\" onclick=\"clockOut(this)\">Clock Out</a>"+
									"</div>"+
								"</li>";
						});
			        }
			    });
}

function selectActiveClock(element){
	if(element.classList.contains("e-selected")){
		element.classList.remove("e-selected");
	} else {
		element.classList.add("e-selected");
	}
}

function eidPull(){
	var id = $('input[name="eid"]').val();
	if(id.toString().length == 6){
		var at = $('var[id="ajaxToken"]')[0].getAttribute("data-ajaxtoken");
		var si = $('var[id="sessionID"]')[0].getAttribute("data-sessionid");
		$.post("/ajax?action=pullEid",
				    {
				        ajax_token: at,
				        eid: id,
				        sessionID: si
				    },
				    function(data){
				    	var ejson = JSON.parse(data);
						if(ejson[`data`]==null){
							if(ejson[`error`]!=null){
								console.log(error);
							}
							return;
						}
				        if(ejson['data']['status']=="S1"&&ejson[`data`][`has_eid`]) {
				        	var name = ejson['data']['name'];
				        	$(`input[name="name"]`).val(name);
				        }
				    });
	}
}

function clockIn(){
	var id = $('input[name="eid"]').val();
	var ct = $('input[name="ctime"]').val();
	var nm = $('input[name="name"]').val();
	if(id.toString().length == 6 && nm.length > 4 && ct.toString().length == 4){
		var at = $('var[id="ajaxToken"]')[0].getAttribute("data-ajaxtoken");
		var si = $('var[id="sessionID"]')[0].getAttribute("data-sessionid");
		$.post("/ajax?action=clockIn",
				    {
				        ajax_token: at,
				        eid: id,
						name: nm,
						ctime: ct,
				        sessionID: si
				    },
				    function(data){
				    	var ejson = JSON.parse(data);
						if(ejson[`data`]==null){
							if(ejson[`error`]!=null){
								console.log(ejson[`error`]);
							}
							$(`input[name="eid"]`).val("");
							$('form.form-clock')[0].classList.add('error');
							$(`input[name="eid"]`).focus();
							return false;
						}
				        if(ejson['data']['status']=="S1"&&ejson[`data`][`clocked_in`]) {
				        	$(`input[name="name"]`).val("");
							$(`input[name="eid"]`).val("");
							$(`input[name="ctime"]`).val("");
							$(`input[name="eid"]`).focus();
							setTimeout(updateBreaks, 400);
				        }
				    });
	}
	return false;
}

function clockOut(element){
	var at = $('var[id="ajaxToken"]')[0].getAttribute("data-ajaxtoken");
	var si = $('var[id="sessionID"]')[0].getAttribute("data-sessionid");
	var id = element.parentElement.querySelector(".clock-item.eid").textContent;
	$.post("/ajax?action=clockOut",
			    {
			        ajax_token: at,
			        eid: id,
			        sessionID: si
			    },
			    function(data){
			    	var ejson = JSON.parse(data);
					if(ejson[`data`]==null){
						if(ejson[`error`]!=null){
							console.log(ejson[`error`]);
						}
					}
			        if(ejson['data']['status']=="S1"&&!ejson[`data`][`clocked_in`]) {
						setTimeout(updateBreaks, 400);
			        }
			    });
}

function clockTens() {
	var today = new Date();
	var time = today.getHours()*100 + today.getMinutes();
	document.querySelectorAll('#clocks-active li.e-selected .clock-emp .clock-item.eid').forEach(function(element){
		clockTen(element.innerHTML, time);
		element.parentElement.parentElement.classList.remove("e-selected");
	});
	setTimeout(updateBreaks, 400);
}

function clockTen(id, t){
	var at = $('var[id="ajaxToken"]')[0].getAttribute("data-ajaxtoken");
	var si = $('var[id="sessionID"]')[0].getAttribute("data-sessionid");
	$.post("/ajax?action=clockTen",
			    {
			        ajax_token: at,
			        eid: id,
					time: t,
			        sessionID: si
			    },
			    function(data){
			    	var ejson = JSON.parse(data);
					if(ejson[`data`]==null){
						if(ejson[`error`]!=null){
							console.log(ejson[`error`]);
						}
					}
			    });
}

function clockThs() {
	var today = new Date();
	var time = today.getHours()*100 + today.getMinutes();
	document.querySelectorAll('#clocks-active li.e-selected .clock-emp .clock-item.eid').forEach(function(element){
		clockTh(element.innerHTML, time);
		element.parentElement.parentElement.classList.remove("e-selected");
	});
	setTimeout(updateBreaks, 400);
}

function clockTh(id, t){
	var at = $('var[id="ajaxToken"]')[0].getAttribute("data-ajaxtoken");
	var si = $('var[id="sessionID"]')[0].getAttribute("data-sessionid");
	$.post("/ajax?action=clockThirty",
			    {
			        ajax_token: at,
			        eid: id,
					time: t,
			        sessionID: si
			    },
			    function(data){
			    	var ejson = JSON.parse(data);
					if(ejson[`data`]==null){
						if(ejson[`error`]!=null){
							console.log(ejson[`error`]);
						}
					}
			    });
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}