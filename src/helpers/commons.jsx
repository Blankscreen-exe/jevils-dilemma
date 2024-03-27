/**
 * Declare all common helper functions here
 */

export function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
  
    const lastSpaceIndex = text.lastIndexOf(" ", maxLength);
  
    if (lastSpaceIndex !== -1) {
      return text.substring(0, lastSpaceIndex) + "...";
    }

    return text.substring(0, maxLength) + "...";
  }
  
  export function formatDate(date) {
      console.log(date)
      const dateObject = new Date(date)
    const day = dateObject.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[dateObject.getMonth()];
    const year = dateObject.getFullYear();
  
    // Add ordinal suffix for the day (e.g., "1st", "2nd", "3rd", "4th")
    const ordinalSuffix = ["th", "st", "nd", "rd"][
      day % 10 > 3 ? 0 : (((day % 100) - (day % 10) !== 10) * day) % 10
    ];
  
    return `${day}${ordinalSuffix} ${month}, ${year}`;
  }