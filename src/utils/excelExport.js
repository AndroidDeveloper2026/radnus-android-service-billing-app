import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Platform, Alert } from 'react-native';


export const downloadAsExcel = async (data, filename) => {
  if (!data || data.length === 0) {
    Alert.alert('No Data', 'There is no data to download');
    return false;
  }

  try {
    // Prepare worksheet data
    const worksheetData = data;

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Auto-size columns
    const maxWidths = {};
    if (worksheetData.length > 0) {
      Object.keys(worksheetData[0]).forEach(key => {
        let maxLen = key.length;
        worksheetData.forEach(row => {
          const val = String(row[key] ?? '-');
          maxLen = Math.max(maxLen, Math.min(val.length, 50));
        });
        maxWidths[key] = Math.min(maxLen, 50);
      });
      
      worksheet['!cols'] = Object.keys(worksheetData[0]).map(key => ({
        wch: maxWidths[key]
      }));
    }

    // Style the header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center" }
      };
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fullFilename = `${filename}_${timestamp}.xlsx`;
    
    // Save to app's cache directory (NO PERMISSION NEEDED)
    const cachePath = `${RNFS.CachesDirectoryPath}/${fullFilename}`;
    await RNFS.writeFile(cachePath, excelBuffer, 'base64');
    
    
    // Show success message with share option
    Alert.alert(
      'Excel File Ready',
      `Your file "${fullFilename}" is ready!\n\nChoose an option below:`,
      [
        { 
          text: 'Share', 
          style: 'default',
          onPress: async () => {
            try {
              await Share.open({
                url: `file://${cachePath}`,
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                title: 'Share Excel Report',
                message: 'Here is your exported report',
              });
              // Clean up after sharing
              setTimeout(async () => {
                try {
                  await RNFS.unlink(cachePath);
                } catch (e) {
                  // console.log('Cleanup error:', e);
                }
              }, 30000);
            } catch (shareError) {
              Alert.alert('Info', 'You can find the file in app cache');
            }
          }
        },
        { 
          text: 'Save to Device', 
          style: 'default',
          onPress: async () => {
            // For Android, try to save to Downloads
            if (Platform.OS === 'android') {
              try {
                const downloadsPath = `${RNFS.DownloadDirectoryPath}/${fullFilename}`;
                await RNFS.copyFile(cachePath, downloadsPath);
                Alert.alert('Success', `File saved to Downloads folder:\n${fullFilename}`);
              } catch (copyError) {
                Alert.alert('Info', 'File is in app cache. Use Share to save it.');
              }
            } else {
              Alert.alert('Info', 'Use Share to save the file to your desired location');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Export Failed', error.message || 'Failed to create file');
    return false;
  }
};


export const prepareExportData = (reportType, data, extractJobFields = null) => {
  if (!data || data.length === 0) return [];

  switch (reportType) {
    case 'all':
      return data.map((item, index) => {
        const fields = extractJobFields ? extractJobFields(item, index) : item;
        return {
          'SL No': fields.sl || index + 1,
          'Job Sheet No': fields.jobNo || '-',
          'Customer Name': fields.customerName || '-',
          'Contact': fields.contact || '-',
          'Alt Contact': fields.altContact || '-',
          'Make': fields.makeId || '-',
          'Model': fields.modelId || '-',
          'IMEI': fields.imei || '-',
          'Warranty': fields.warranty || '-',
          'Status': fields.status || '-',
          'Engineer': fields.engineerId || '-',
          'Dealer': fields.dealerName || '-',
          'Drawer': fields.drawerId || '-',
          'Service Charge (₹)': fields.serviceCharges || 0,
          'Spare Charge (₹)': fields.spareCharges || 0,
          'Total (₹)': fields.total || 0,
          'Payment Mode': fields.paymentMode || '-',
          'Problems': fields.problems || '-',
          'Physical Condition': fields.physicalCond || '-',
          'Accessories': fields.accessories || '-',
          'Repair Date': fields.repairDate || '-',
          'Delivery Date': fields.deliveryDate || '-',
          'Remarks': fields.remarks || '-',
          'Saved Date': fields.savedDate || '-',
          'Created By': fields.createdBy || '-',
        };
      });

    case 'engineer': {
      const flattened = [];
      data.forEach(engGroup => {
        const engineerName = engGroup.engineer || engGroup.title?.replace(/ \(\d+ jobs\)/, '') || 'Unassigned';
        const jobs = engGroup.jobs || engGroup.data || [];
        jobs.forEach((job, idx) => {
          const fields = extractJobFields ? extractJobFields(job, idx) : job;
          flattened.push({
            'Engineer': engineerName,
            'Job No': fields.jobNo || '-',
            'Customer Name': fields.customerName || '-',
            'Contact': fields.contact || '-',
            'Device': `${fields.makeId || ''} ${fields.modelId || ''}`.trim() || '-',
            'Status': fields.status || '-',
            'Service Charge (₹)': fields.serviceCharges || 0,
            'Spare Charge (₹)': fields.spareCharges || 0,
            'Total (₹)': fields.total || 0,
            'Received Date': fields.savedDate || '-',
            'Delivery Date': fields.deliveryDate || '-',
          });
        });
      });
      return flattened;
    }

    case 'value':
      return data.map(item => ({
        'Job No': item.jobNo || '-',
        'Customer Name': item.name || item.customerName || '-',
        'Received Date': item.received || '-',
        'Repaired Date': item.repaired || '-',
        'Delivered Date': item.delivered || '-',
        'Service Charge (₹)': item.service || 0,
        'Spare Charge (₹)': item.spare || 0,
        'Total (₹)': item.total || 0,
      }));

    case 'spare':
      return data.map(item => ({
        'Job Sheet No': item.jobSheet || '-',
        'Spare Part Name': item.spare || '-',
        'Quantity': item.qty || 0,
        'Rate (₹)': item.rate || 0,
        'Amount (₹)': item.amount || 0,
      }));

    case 'dealer':
      return data.map((item, index) => ({
        'SL No': index + 1,
        'Dealer Name': item.dealerName || '-',
        'Customer Name': item.customerName || '-',
        'Contact': item.contact || '-',
        'Device': `${item.makeId || ''} ${item.modelId || ''}`.trim() || '-',
        'Date': item.savedDate || '-',
        'Status': item.status || '-',
        'Service (₹)': item.serviceCharges || 0,
        'Spare (₹)': item.spareCharges || 0,
        'Total (₹)': (item.serviceCharges || 0) + (item.spareCharges || 0),
      }));

    case 'daily':
      return data.map(item => ({
        'Date': item.date || '-',
        'Count': item.count || 0,
      }));

    case 'pending':
      return data.map((item, index) => ({
        'SL No': index + 1,
        'Job No': item.jobNo || '-',
        'Customer Name': item.customerName || '-',
        'Contact': item.contact || '-',
        'Make/Model': `${item.makeId || ''} ${item.modelId || ''}`.trim() || '-',
        'Received Date': item.savedDate || '-',
        'Status': item.status || '-',
        'Engineer': item.engineerId || '-',
      }));

    case 'deliveredNRNA':
      return data.map((item, index) => ({
        'SL No': index + 1,
        'Job No': item.jobNo || '-',
        'Customer Name': item.customerName || '-',
        'Contact': item.contact || '-',
        'Device': `${item.makeId || ''} ${item.modelId || ''}`.trim() || '-',
        'Delivered Date': item.deliveryDate || '-',
        'Physical Condition': item.physicalCond || '-',
        'Remarks': item.remarks || '-',
      }));

    default:
      return data;
  }
};