import ExcelJS from "exceljs";

import {
  getCollectionIntakeReports,
  getMrfInventoryReport,
  getProgramFundsReport,
  getRedemptionReports,
} from "../utils/reportHelpers.js";
import { EducationalLevel } from "../generated/prisma/index.js";

const filterReports = async (req, res) => {
  try {
    const { barangayId } = req.user;
    const { startDate, endDate, type, programId } = req.query;

    if (!startDate || !endDate || !type) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (
      ![
        "mrf-inventory",
        "collection-intake",
        "redemption",
        "program-funds",
      ].includes(type)
    ) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    switch (type) {
      case "mrf-inventory": {
        const { results } = await getMrfInventoryReport(
          barangayId,
          startDate,
          endDate,
        );

        return res.status(200).json({
          message: "Fetch MRF Inventory reports successful",
          results,
        });
      }

      case "collection-intake": {
        const { mergedRecords } = await getCollectionIntakeReports(
          barangayId,
          startDate,
          endDate,
        );

        return res.status(200).json({
          message: "Fetch collection records successful",
          mergedRecords,
        });
      }
      case "redemption": {
        const { merged } = await getRedemptionReports(
          barangayId,
          startDate,
          endDate,
          programId,
        );

        return res.status(200).json({
          message: "Fetch beneficiary redemption records successful",
          merged,
        });
      }
      case "program-funds": {
        const { mergedRows, totalExpense, totalIncome, net } =
          await getProgramFundsReport(barangayId, startDate, endDate);

        return res.status(200).json({
          message: "Fetch program funds record successful",
          mergedRows,
          totalIncome,
          totalExpense,
          net,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const exportReports = async (req, res) => {
  try {
    const { mrfInventory, collectionIntake, redemption, programFunds } =
      req.body ?? {};
    const { barangayId } = req.user;

    const { startDate: mrfStart, endDate: mrfEnd } = mrfInventory;
    const { startDate: collectionStart, endDate: collectionEnd } =
      collectionIntake;
    const {
      startDate: redemptionStart,
      endDate: redemptionEnd,
      programId,
    } = redemption;
    const { startDate: fundsStart, endDate: fundsEnd } = programFunds;

    if (
      !mrfStart ||
      !mrfEnd ||
      !collectionStart ||
      !collectionEnd ||
      !redemptionStart ||
      !redemptionEnd ||
      !fundsStart ||
      !fundsEnd
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [mrfResult, collectionResult, redemptionResult, fundsResult] =
      await Promise.all([
        getMrfInventoryReport(barangayId, mrfStart, mrfEnd),
        getCollectionIntakeReports(barangayId, collectionStart, collectionEnd),
        getRedemptionReports(
          barangayId,
          redemptionStart,
          redemptionEnd,
          programId,
        ),
        getProgramFundsReport(barangayId, fundsStart, fundsEnd),
      ]);

    const { results } = mrfResult;
    const { mergedRecords } = collectionResult;
    const { merged } = redemptionResult;
    const { mergedRows, totalIncome, totalExpense, net } = fundsResult;

    const workbook = new ExcelJS.Workbook();

    const addTitleRow = (
      sheet,
      title,
      startDate,
      endDate,
      lastColumnLetter,
    ) => {
      sheet.addRow([`${title} (${startDate} to ${endDate})`]);
      sheet.mergeCells(`A1:${lastColumnLetter}1`);
      sheet.getRow(1).font = { bold: true, size: 14 };
      sheet.getRow(1).alignment = { horizontal: "left" };
    };

    const mrfInventorySheet = workbook.addWorksheet("MRF Inventory Report");

    addTitleRow(
      mrfInventorySheet,
      "MRF Inventory Report",
      mrfStart,
      mrfEnd,
      "F",
    );

    mrfInventorySheet.addRow([]);
    mrfInventorySheet.getRow(3).values = [
      "Date",
      "Material",
      "Material Category",
      "Quantity In",
      "Quantity Out",
      "Net",
    ];
    mrfInventorySheet.getRow(3).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    mrfInventorySheet.getRow(3).font = { bold: true, size: 11 };
    mrfInventorySheet.getColumn(1).width = 15; // Date
    mrfInventorySheet.getColumn(2).width = 25; // Material
    mrfInventorySheet.getColumn(3).width = 20; // Material Category
    mrfInventorySheet.getColumn(4).width = 15; // Quantity In
    mrfInventorySheet.getColumn(5).width = 15; // Quantity Out
    mrfInventorySheet.pageSetup.fitToPage = true

    results.forEach((row) => {
      const newRow = mrfInventorySheet.addRow([
        row.date,
        row.material,
        row.category,
        row.quantityIn,
        row.quantityOut,
        row.net,
      ]);
      newRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const collectionIntakeSheet = workbook.addWorksheet(
      "Collection Intake Report",
    );

    addTitleRow(
      collectionIntakeSheet,
      "Collection & Intake Report",
      collectionStart,
      collectionEnd,
      "F",
    );

    collectionIntakeSheet.addRow([]);
    collectionIntakeSheet.getRow(3).values = [
      "Resident",
      "Date",
      "Channel",
      "Materials",
      "Quantity",
      "Category",
    ];
    collectionIntakeSheet.getRow(3).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        right: { style: "thin" },
        botttom: { style: "thin" },
        left: { style: "thin" },
      };
    });

    collectionIntakeSheet.getRow(3).font = { bold: true, size: 11 };
    collectionIntakeSheet.getColumn(1).width = 22; // Resident
    collectionIntakeSheet.getColumn(2).width = 15; // Date
    collectionIntakeSheet.getColumn(3).width = 18; // Channel
    collectionIntakeSheet.getColumn(4).width = 25; // Materials
    collectionIntakeSheet.getColumn(5).width = 15; // Quantity
    collectionIntakeSheet.getColumn(6).width = 18; // Category
    collectionIntakeSheet.pageSetup.fitToPage = true;


    collectionIntakeSheet.getColumn(4).alignment = {
      wrapText: true,
      vertical: "top",
    };
    collectionIntakeSheet.getColumn(5).alignment = {
      wrapText: true,
      vertical: "top",
    };
    collectionIntakeSheet.getColumn(6).alignment = {
      wrapText: true,
      vertical: "top",
    };

    mergedRecords.forEach((row) => {
      const newRow = collectionIntakeSheet.addRow([
        row.residentName,
        row.date,
        row.channel,
        row.materials.map((m) => m.name).join("\n"),
        row.materials
          .map((m) => `${m.quantity}${m.unit === "PIECE" ? "pcs" : m.unit}`)
          .join("\n"),
        row.materials.map((m) => m.category).join("\n"),
      ]);
      newRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
        };
      });
    });

    const redemptionRewardsSheet = workbook.addWorksheet(
      "Redemption & Rewards Report",
    );

    addTitleRow(
      redemptionRewardsSheet,
      "Redemption & Rewards Report",
      redemptionStart,
      redemptionEnd,
      "J",
    );

    redemptionRewardsSheet.addRow([]);
    redemptionRewardsSheet.getRow(3).values = [
      "Beneficiary",
      "Educational Level",
      "Date Submitted",
      "Materials Collected",
      "Quantity",
      "Category",
      "Earned",
      "Reward Received",
      "Date Released",
      "Spent",
    ];

    redemptionRewardsSheet.getRow(3).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
      }
    })
    redemptionRewardsSheet.getRow(3).font = { bold: true, size: 11 };
    redemptionRewardsSheet.getColumn(1).width = 22; // Beneficiary
    redemptionRewardsSheet.getColumn(2).width = 20; // Educational Level
    redemptionRewardsSheet.getColumn(3).width = 18; // Date Submitted
    redemptionRewardsSheet.getColumn(4).width = 25; // Materials Collected
    redemptionRewardsSheet.getColumn(5).width = 12; // Quantity
    redemptionRewardsSheet.getColumn(6).width = 18; // Category
    redemptionRewardsSheet.getColumn(7).width = 12; // Earned
    redemptionRewardsSheet.getColumn(8).width = 20; // Reward Received
    redemptionRewardsSheet.getColumn(9).width = 18; // Date Released
    redemptionRewardsSheet.getColumn(10).width = 12; // Spent
    redemptionRewardsSheet.pageSetup.fitToPage = true
    redemptionRewardsSheet.pageSetup.orientation = "landscape"

    redemptionRewardsSheet.getColumn(4).alignment = {
      wrapText: true,
      vertical: "top",
    };
    redemptionRewardsSheet.getColumn(5).alignment = {
      wrapText: true,
      vertical: "top",
    };
    redemptionRewardsSheet.getColumn(8).alignment = {
      wrapText: true,
      vertical: "top",
    };
    redemptionRewardsSheet.getColumn(9).alignment = {
      wrapText: true,
      vertical: "top",
    };

    merged.forEach((row) => {
      const hasReleases = row.rewardReceived.length > 0;

      const newRow = redemptionRewardsSheet.addRow([
        row.beneficiaryName,
        row.educationalLevel,
        row.dateSubmitted,
        row.materialsCollected.map((item) => item.name).join("\n"),
        row.materialsCollected
          .map((item) => `${item.amount}${item.unit === "PIECE" ? "pcs" : item.unit}`)
          .join("\n"),
        row.materialsCollected.map((item) => item.category).join("\n"),
        row.isCashMode ? `₱${row.pointsEarned}` : `${row.pointsEarned} pts`,
        row.isCashMode
          ? "—"
          : hasReleases
            ? row.rewardReceived
                .map((item) => `${item.quantity}x ${item.name}`)
                .join("\n")
            : "Not yet released",
        row.isCashMode
          ? "—"
          : hasReleases
            ? row.rewardReceived.map((item) => item.date.toISOString().slice(0, 10)).join("\n")
            : "Not yet released",
        row.isCashMode ? "—" : hasReleases ? row.pointsSpent : "0 pts",
      ]);

      newRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          right: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
        }
      })
    });

    const fundsSheet = workbook.addWorksheet("Program Funds Report");

    addTitleRow(fundsSheet, "Program Funds Report", fundsStart, fundsEnd, "G");

    fundsSheet.addRow([])
    fundsSheet.addRow(["Total Income", totalIncome]);
    fundsSheet.addRow(["Total Expenses", totalExpense]);
    fundsSheet.addRow(["Net", net]);
    fundsSheet.getColumn(1).font = { bold: true };
    fundsSheet.getRow(3).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      }
    })
    fundsSheet.getRow(4).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      }
    })
    fundsSheet.getRow(5).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      }
    })

    fundsSheet.addRow([]);

    fundsSheet.getRow(8).values = [
      "Type", 
      "Name",
      "Description",
      "Program",
      "Amount",
      "Performed By",
      "Date",
    ];

    fundsSheet.getRow(8).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    })
    fundsSheet.getRow(8).font = { bold: true, size: 11 };
    fundsSheet.getColumn(1).width = 18 // Type
    fundsSheet.getColumn(2).width = 20 // Name
    fundsSheet.getColumn(3).width = 30 // Description
    fundsSheet.getColumn(4).width = 28 // Program
    fundsSheet.getColumn(5).width = 12 // Amount
    fundsSheet.getColumn(6).width = 28 // Performed By
    fundsSheet.getColumn(7).width = 15 // Date
    fundsSheet.pageSetup.fitToPage = true
    fundsSheet.pageSetup.orientation = "landscape"

    mergedRows.forEach((row) => {
      const newRow = fundsSheet.addRow([
        row.type,
        row.name,
        row.description,
        row.program,
        row.type === "income" ? `+${row.amount}` : `-${row.amount}`,
        `${row.performedBy} (${row.performedByRole})`,
        row.date,
      ]);

      newRow.eachCell((cell) => {
        cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
      })
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="reports-export.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { filterReports, exportReports };
