//format date to e.g. 01 Jan 2023 format
export const formatDateToDisplay = date => {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
