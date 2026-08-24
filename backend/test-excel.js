import ExcelJS from "exceljs"

const workbook = new ExcelJS.Workbook();

const sheet = workbook.addWorksheet("Fruits")

sheet.columns = [
    { header: "Name", key: "name" },
    { header: "Quantity", key: "quantity" }
]

sheet.getRow(1).font = { bold: true, size: 12 }

sheet.addRow({ name: "Apple", quantity: 10 })
sheet.addRow({ name: "Banana", quantity: 5 })



await workbook.xlsx.writeFile("fruits.xlsx")

console.log("Done!")