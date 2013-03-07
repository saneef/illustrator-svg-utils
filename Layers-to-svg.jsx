// (c) Copyright 2013 Adobe Systems, Inc. All rights reserved.
// author David Deraedt

#target illustrator

function exportFileToSVG (dest) {

  var exportOptions = new ExportOptionsSVG();
  var type = ExportType.SVG;
  var fileSpec = new File(dest);
  //$.writeln(dest);

  exportOptions.embedRasterImages = true;

  app.activeDocument.exportFile( fileSpec, type, exportOptions );

}

function caluclateBounds(docBounds, height, width) {
  var newBounds, mx, my;

  newBounds = new Array();

  mx = (docBounds[2] - docBounds[0])/2 + docBounds[0];
  my = (docBounds[1] - docBounds[3])/2 + docBounds[3];

  newBounds[0] = mx - width/2;
  newBounds[1] = my + height/2;

  newBounds[2] = mx + width/2;
  newBounds[3] = my - height/2;

  return newBounds;
}

function setLayersVisibility(visible) {

  var n = app.activeDocument.layers.length;
  for ( var i = 0 ; i < n ; i++){
    var l = app.activeDocument.layers[i];
    l.visible = visible;
  }
}

createDialog = function(svgDimensions) {
  var dlg = new Window(
    'dialog',
    'Provide SVG File Dimensions',
    [100, 100, 360, 240]
  );

  dlg.heightStaticText = dlg.add('statictext', [10, 10, 140, 30], 'Height');
  dlg.heightEditText = dlg.add('edittext', [90, 10, 160, 30]);

  dlg.widthStaticText = dlg.add('statictext', [10, 40, 140, 30], 'Width');
  dlg.widthEditText = dlg.add('edittext', [90, 40, 160, 60]);

  dlg.applyButton = dlg.add('button', [10, 80, 160, 110], 'Continue');
  dlg.skipButton = dlg.add('button', [170, 80, 210, 110], 'Skip');

  dlg.skipButton.onClick = function() {
    dlg.close();
  }

  dlg.applyButton.onClick = function() {
    svgDimensions.height = parseInt(dlg.heightEditText.text);
    svgDimensions.width = parseInt(dlg.widthEditText.text);
    dlg.close();
  }

  return dlg;
}

function init(){
  var svgDimensions = {
    height: 0,
    width: 0
  };

  var win = createDialog(svgDimensions);
  win.show();

  var destFolder = Folder.selectDialog ("Select Destination Folder");
  if(!destFolder) return;

  setLayersVisibility(false);

  var dest = destFolder.path +"/"+ destFolder.name+"/";

  var doc = app.activeDocument;

  var n = doc.layers.length;

  for ( var j = 0 ; j < n ; j++){
    var l = doc.layers[j];
    l.visible = true;
    l.hasSelectedArtwork = true;

    if ((svgDimensions.height != 0) && (svgDimensions.width != 0)) {
      doc.artboards[0].artboardRect = caluclateBounds(doc.visibleBounds, svgDimensions.height, svgDimensions.width);
    } else {
      doc.artboards[0].artboardRect = doc.visibleBounds;
    }

    exportFileToSVG(dest + l.name);
    l.visible = false;
  }

  setLayersVisibility(true);
}

if ( app.documents.length > 0 ) {
  init();
}