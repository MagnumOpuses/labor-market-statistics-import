
const stringMonthSorterHelp = (a, b) =>{
    //a and b are strings
    let key1 = new Date(a); 
    let key2 = new Date(b);
    if( key1 < key2){
        return -1;
    } else if(key1 == key2){
        return 0;
    } else {
        return 1;
    }
};

module.exports = {
    stringMonthSorterHelp
}