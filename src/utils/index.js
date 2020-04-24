//======== UTILS  ===========
export const convertTime = (unixTime, time = false) => {
  const date = new Date(unixTime * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = "0" + date.getMinutes();
  const seconds = "0" + date.getSeconds();

  let formatted = day + "/" + month + "/" + year;
  if (time) {
    formatted +=
      " " + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  }
  return formatted;
};
