function tableView(container,doc) {
    var nv; 
    //The vars specific to a tableView
    // global to this function since I need it in addRow
    var activeSingleQuery = null;
    
    this.document=null;
    if(doc)
      this.document=doc;
    else
      this.document=document;
    
    //The necessary vars for a View...
    this.name="Table";        //Display name of this view.
    this.queryStates=[];          //All Queries currently in this view.
    this.container=container; //HTML DOM parent node for this view.
    this.container.setAttribute('ondblclick','tableDoubleClick(event)')
    // this.container.setAttribute('onclick', 'onClickCell');
    
    // q is a query object 
    this.drawQuery = function (q) {
        //alert(q);
        //alert(q.pat);
        //alert(q.vars);
        //alert(q.orderBy);
        //alert(q.name);
        //alert(q.id);
        this.onBinding = function (bindings) {
            var i, tr, td;
            tabulator.log.info("making a row w/ bindings " + bindings);
            tr = this.document.createElement('tr');
            t.appendChild(tr);
            for (i=0; i<nv; i++) {
                v = q.vars[i];
                //alert("calling matrixTD");
                //alert(matrixTD(bindings[v]).innerHTML);
                //alert(bindings[v].termType);
                tr.appendChild(matrixTD(bindings[v]));
            } //for each query var, make a row
        }
        var i, td, th, j, v;
        var t = this.document.createElement('table');
        var tr = this.document.createElement('tr');
        nv = q.vars.length; // made this global b/c i need it in the addRows function
        
        t.appendChild(tr);
        t.setAttribute('class', 'results sortable'); //changed back to 'results sortable'!?
        t.setAttribute('id', 'tabulated_data'); //needed to make sortable
        emptyNode(this.container).appendChild(t); // See results as we go
        for (i=0; i<nv; i++) {
            v = q.vars[i]; //'v0?'
            //alert(q.vars);
            //alert(q);
            //alert(v);
            //alert(v.label);
            //tabulator.log.debug("table header cell for " + v + ': '+v.label)
            th = this.document.createElement('th');
            th.appendChild(this.document.createTextNode(v.label));
            tr.appendChild(th);
        }
        drawExport();
        drawAddRow();
        //alert(kb.query(q, this.onBinding, myFetcher));
        kb.query(q, this.onBinding, myFetcher);
        activeSingleQuery = q;
        this.queryStates[q.id]=1;
        sortables_init();
       
        // alert (container.innerHTML);
        // This is the eventListener for Table Editing
        this.document.getElementById('tabulated_data').addEventListener('click', onClickCell, false);

        function onClickCell(e) {
            var srcElem = getTarget(e);
            if (srcElem.tagName != "td") return;
            else onEdit(e);
        }

        //Use getTdNode to avoid div and span elements
        function getTDNode(e) {
            var srcElem = getTarget(e);
            var tdNode = ancestor(srcElem, "TD");
            return tdNode;
        }

        function onEdit(e) {
            var tdNode = getTDNode(e);
            //alert(tdNode.className);
            var oldTxt = tdNode.innerHTML;
            var inputObj = document.createElement('INPUT');
            if (literalNodeTD(tdNode)) return;
            if (tdNode.firstChild && tdNode.firstChild.tagName == "INPUT") return;
            inputObj.style.width = "99%";
            inputObj.value = oldTxt;
            inputObj.type = "TEXT";
            inputObj.addEventListener ("blur", focusLost, false);
            inputObj.addEventListener ("keypress", checkForEnter, false);
            tdNode.replaceChild(inputObj, tdNode.firstChild);
            inputObj.select();
        }

        function focusLost(e) {
            var srcElem = getTarget(e);
            srcElem.parentNode.innerHTML = srcElem.value;
            //Add code here to handle SPARQL query.  Make a call to clearInputAndSave.  
        }

        function checkForEnter(e) {
            if (e.keyCode == 13) focusLost (e);
        }
        
/*        
        document.getElementById('tabulated_data').addEventListener('mousemove', tableResize_OnMouseMoveBefore, false);
        document.getElementById('tabulated_data').addEventListener('mousedown', tableResize_OnMouseDown, false);
        
        
var resizeElement = "TH"; //Elements to be resized
var edgeThreshold = 2;
var rBarID = "rBar";

var resizeTarget = null; //position and distance moved
var startX = null;
var endX = null;
var sizeX = null;
var adjacentCell = null;

//Creates rBar on load 
function tableResize_CreateResizeBar() {
    var objItem = document.getElementById(rBarID);
    if(!objItem) {
        objItem = document.createElement("DIV");
        objItem.id = rBarID;
        objItem.style.position = "absolute";
        objItem.style.top = "0px";
        objItem.style.left = "0px";
        objItem.style.height = "100px";
        objItem.style.border = "1px solid black";
        objItem.style.display = "none";
        document.body.appendChild(objItem);
    }
}
window.addEventListener("load", tableResize_CreateResizeBar,0);

function tableResize_GetHeader(objReference) {
    var oElement = objReference;
    if(oElement.tagName.toUpperCase() == resizeElement) {
        return oElement; //print alert?
    }
    return null;
}

function tableResize_CleanUp() {
    //document.getElementById('debug').value += 'Entered CleanUp\n';
    var rBar = document.getElementById(rBarID);
    if(rBar) {
        rBar.style.display = "none";
    }
    endX = null;
    sizeX = null;
    startX = null;
    resizeTarget = null;
    adjacentCell = null;
    return true;
}

function tableResize_OnMouseMoveBefore (event) {
    //document.getElementById('debug').value += 'Entered OnMouseMoveBefore\n';
    var objTH = tableResize_GetHeader(event.target); if (!objTH ) return;

    //document.getElementById('coords').value += "event.clientX " + event.clientX + "\n";
    //document.getElementById('coords').value += "event.layerX " + event.layerX + "\n";
    //document.getElementById('coords').value += "offsetWidth " + objTH.offsetWidth+ "\n";
    if (event.layerX >= (objTH.offsetWidth - edgeThreshold)) {
        objTH.style.cursor = "e-resize";
    }
    else {
        objTH.style.cursor = "";
    }
    return true;
}

////////////////////// HERE"S THE IMPORTANT CODE  /////////////////////////////
//// In order to use layerX, each TH must have style="position: relative"; ////

function tableResize_OnMouseDown(event) {
    //document.getElementById('debug').value += 'Entered OnMouseDown\n';
    objTable = this;
    var objTH = tableResize_GetHeader(event.target); if (!objTH) return;
    var rBar = document.getElementById(rBarID); if(!rBar) return;
    // adjacentCell = objTH.nextSibling.nextSibling;
    // alert(objTH.innerHTML);
    // alert(adjacentCell.innerHTML);
    
    //IT DOESN"T SEEM TO GET PAST THIS STEP!

    if ((objTH.tagName.toUpperCase() == resizeElement) && (objTH.style.cursor == "e-resize")) { 
        startX = event.clientX;
        resizeTarget = objTH;
        
        rBar.style.left = event.clientX + window.pageXOffset;
        rBar.style.top = objTable.parentNode.offsetTop + window.pageYOffset;
        rBar.style.height = objTable.parentNode.clientHeight;
        rBar.style.display = "inline"; // THIS IS CRUCIAL
    }
    document.getElementById("tabulated_data").addEventListener("mousemove", tableResize_OnMouseMoveAfter, true);  
    document.getElementById("tabulated_data").addEventListener("mouseup", tableResize_HeaderProblem, true); //this handles a problem with clickling on the header and then not exiting OnMouseMoveAfter
    document.getElementById(rBarID).addEventListener("mouseup", tableResize_OnMouseUp, true);
    alert("EventListeners added");
}


function tableResize_HeaderProblem (event) {
    //document.getElementById('debug').value += 'Entered HeaderProblem\n';
    document.getElementById("tabulated_data").removeEventListener("mousemove", tableResize_OnMouseMoveAfter, true);
}


// doesn't seem like I ever enter OnMouseAfter

function tableResize_OnMouseMoveAfter(event) {
    //document.getElementById('debug').value += 'Entered OnMouseMoveAfter\n';
    rBar.style.left = event.clientX + window.pageXOffset;
    //document.getElementById("coords").value += rBar.style.left + "\n"; 
    event.stopPropagation();
}

function tableResize_OnMouseUp(event) {
    //document.getElementById('debug').value += 'Entered OnMouseUp\n';
    var iAdjCellOldWidth = 0;
    var iResizeOldWidth = 0;
    var rBar = document.getElementById(rBarID); 

    //resize target is already defined in onmousedown
    var adjacentCell = resizeTarget.nextSibling.nextSibling;
    //alert(adjacentCell);
    
    //--------------------------------------
    // set the width on resizeTarget
    // the distance that resizeTarget moves is startX+endX
    var endX = event.clientX;
    // startX is already defined
    var distanceMoved = endX - startX;
    var newPosition = startX + distanceMoved;
    var oldCellWidth = resizeTarget.offsetWidth;
    //document.getElementById("coords").value += "startX " + startX + "\n";
    //document.getElementById("coords").value += "endX " + endX + "\n";
    //document.getElementById("coords").value += "oldCellWidth " + oldCellWidth + "\n"
    resizeTarget.style.width = oldCellWidth + distanceMoved;
    //document.getElementById("coords").value += "newCellWidth " + newCellWidth + "\n"; 
    
    //-------------------------------------
    // set the width on adjacent Cell
    // the distance that the adjacentCell moves is 
    var oldAdjacentWidth = adjacentCell.offsetWidth;
    adjacentCell.style.width = oldAdjacentWidth - distanceMoved;
    
    document.getElementById("tabulated_data").removeEventListener("mousemove", tableResize_OnMouseMoveAfter, true);
    document.getElementById(rBarID).removeEventListener("mouseup", tableResize_OnMouseUp, true);
    event.stopPropagation();
    tableResize_CleanUp();
}*/
// Write getAdjacentCell function

    } //this.drawQuery
    //alert(this.document);
    function drawAddRow () {
        var form = this.document.createElement('form');
        var but = this.document.createElement('input');
        form.setAttribute('textAlign','right');
        but.setAttribute('type','button');
        but.setAttribute('id','addRowButton');
        but.onclick=addRow;
        but.setAttribute('value','      Add Row      ');
        form.appendChild(but);
        container.appendChild(form);
    }
    
    
    function addRow () {
        // find number of columns in current table
        // create new tr and td elements, set class as editable
        // append these to the table
        // see if editing works
        
        // other variables used: nv
        
        // this should give you a list of all the tabulator project developers in the main tabulator file
        // something matching the q bindings
        // replace that with a selection bar?
        
        
        var i;
        var td;
        var tr = document.createElement('tr');
        var t = document.getElementById('tabulated_data');
        var lastRowNum = t.childNodes.length - 1; // not a very reliable way of getting rownumber
        for (i=0; i<nv; i++) {
            if (literalNodeRC(lastRowNum, i)) 
                td = createNonLiteralNode();
            else 
                td = createLiteralNode();
            tr.appendChild(td);
        }
        t.appendChild(tr);
    }
    
    function createLiteralNode() {
        var td = document.createElement("TD");
        td.innerHTML = "Enter Text";
        return td;
    }
    
    function createNonLiteralNode() {
        var td = document.createElement("TD");
        td.setAttribute('about', '');
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "<form> <select style=\'width:100%\'> <option> nonliteral </option> </select> </form>";
        // set attributes;
        return td;
    }
    
    // checks to see if a TD element has the about attribute
    function literalNodeTD (tdNode) {
        if (tdNode.getAttributeNode('about') != null) return true; 
    }
    
    function literalNodeRC (row, col) {
        var t = document.getElementById('tabulated_data'); 
        var TDNode = t.childNodes[row].childNodes[col];
        if (literalNodeTD (TDNode)) return true;
    }

    function drawExport () {
        var form= this.document.createElement('form');
        var but = this.document.createElement('input');
        form.setAttribute('textAlign','right');
        but.setAttribute('type','button');
        but.setAttribute('id','exportButton');
        but.onclick=exportTable // they should all be like this?
        but.setAttribute('value','Export to HTML');
        form.appendChild(but);
        container.appendChild(form);
    }

    this.undrawQuery = function(q) {
        if(q===activeSingleQuery) {
            this.queryStates[q.id]=0;
            activeSingleQuery=null;
            emptyNode(this.container);
        }
    }   

    this.addQuery = function(q) {
        this.queryStates[q.id]=0;
    }

    this.removeQuery = function (q) {
        this.undrawQuery(q);
        delete this.queryStates[q.id];
        return;
    }

    this.clearView = function () {
        this.undrawQuery(activeSingleQuery);
        activeSingleQuery=null;
        emptyNode(this.container);
    }
} // tableView

function tableDoubleClick(event) {
    var target = getTarget(event);
    var tname = target.tagName;
    var aa = getAbout(kb, target);
    tabulator.log.debug("TabulatorDoubleClick: " + tname + " in "+target.parentNode.tagName)
    if (!aa) return;
    GotoSubject(aa);
}

function exportTable()
{
    /*sel=document.getElementById('exportType')
	var type = sel.options[sel.selectedIndex].value
	
	switch (type)
	{
		case 'cv':

			break;
		case 'html':
*/
	var win=window.open('table.html','Save table as HTML');
    var tbl=this.document.getElementById('tabulated_data');
    win.document.write('<TABLE>');
    for(j=0;j<tbl.childNodes[0].childNodes.length;j++)
    {
        win.document.write('<TH>'+ts_getInnerText(tbl.childNodes[0].cells[j])
			   +'</TH>')
    }
    for(i=1;i<tbl.childNodes.length;i++)
    {
        var r=tbl.childNodes[i];
        var j;
        win.document.write('<TR>');
        for(j=0;j<r.childNodes.length;j++) {
            var about = ""
            if (r.childNodes[j].attributes['about'])
                about=r.childNodes[j].attributes['about'].value;
            win.document.write('<TD about="'+about+'">');
            win.document.write(ts_getInnerText(r.childNodes[j]));
            win.document.write('</TD>');
        }
        win.document.write('</TR>');
    }
    win.document.write('</TABLE>');
    win.document.uri='table.html'
    win.document.close();
    /*			break;
	   	case 'sparql':
			//makeQueryLines();
			var spr = document.getElementById('SPARQLText')
			spr.setAttribute('class','expand')
            document.getElementById('SPARQLTextArea').value=queryToSPARQL(myQuery);
			//SPARQLToQuery("PREFIX ajar: <http://dig.csail.mit.edu/2005/ajar/ajaw/data#> SELECT ?v0 ?v1 WHERE { ajar:Tabulator <http://usefulinc.com/ns/doap#developer> ?v0 . ?v0 <http://xmlns.com/foaf/0.1/birthday> ?v1 . }")
			//matrixTable(myQuery, sortables_init)
    		      //sortables_init();
			break;
		case '': 
			alert('Please select a file type');
			break;
	}*/
}
