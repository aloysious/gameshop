KISSY.add(function(S) {



    function fileInfo(inpEl,callback){
        var file,x,extension,name;

        if(inpEl.files && (file = inpEl.files[0])){
            name = file.name;
            file.extension = name.substr(name.lastIndexOf('.')+1);
            callback(file);

        }else{
            file = inpEl.value;

            x = file.lastIndexOf('\\'); //window
            if(x === -1){x = file.lastIndexOf('/');} //unix

            name = file.substr(x+1);

            extension = name.substr(name.lastIndexOf('.')+1).toLowerCase();

            file = {name:name,extension:extension};

            if('png|jpg|jpeg|bmp|gif'.indexOf(extension)!==-1 && S.UA.ie ===6){
                var img  = new Image();
                img.onload = function(){
                    file.size = this.fileSize;
                    callback(file);
                };
                img.src = inpEl.value;
            }else{
                callback(file);
            }
        }
    }

    return fileInfo;
});
