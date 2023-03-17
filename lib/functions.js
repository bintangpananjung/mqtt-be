function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

// function sumDataToPerDay(data,attr){
//     const newData = [];
//     // const now = new Date();
//     data.forEach(element => {
//         const date = new Date(element[attr]);
//         if(date.getDate()===now.getDate() && date.getMonth()===now.getMonth() && date.getFullYear()===now.getFullYear()){

//         }
//     });
// }

module.exports = { delay };
