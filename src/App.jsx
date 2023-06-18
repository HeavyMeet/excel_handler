import { useState } from 'react';
import { utils, read, write } from 'xlsx';

const App = () => {
  const [data, setData] = useState([]);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      alert('Please select an Excel file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
      setData(jsonData);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleCellChange = (row, col) => (event) => {
    const value = event.target.value;
    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
  };

  const handleExport = () => {
    const sheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, 'Data');
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'new-file.xlsx';
    link.click();
  };
  return (
    <div className='container'>
         <div className="uploadInput ">
          <input type="file" onChange={handleFileUpload} className="uploadInput" />
        </div>
      <div className="uploadContainer">
        {data.length > 0 && (
          <div className="tableContainer">
            <table className="table">
              <thead className="tableHeader">
                <tr>
                  {data[0] && data[0].map((cell, index) => (
                    <th key={index} className="tableHeaderCell">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="tableBody">
                {data.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="tableCell">
                        <input
                          value={cell}
                          onChange={handleCellChange(rowIndex + 1, colIndex)}
                          className="input"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="exportContainer">
          <button
            onClick={handleExport}
            disabled={!data.length}
            className="exportButton"
          >
            Export
          </button>
        </div>
    </div>
  );
};


export default App
