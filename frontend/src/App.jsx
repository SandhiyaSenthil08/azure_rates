import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // For Excel export
import { saveAs } from "file-saver"; // To save Excel file
import "./App.css";
function App() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [filteredRates, setFilteredRates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/azure-rates");
        setRates(response.data);
      } catch (error) {
        console.error("Error fetching Azure rates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  

  const applyFilters = () => {
    let filtered = rates;
  
    if (filterText) {
      filtered = filtered.filter((rate) =>
        rate.productName.toLowerCase().includes(filterText.toLowerCase())
      );
    }
  
    if (minPrice) {
      filtered = filtered.filter((rate) => rate.retailPrice >= parseFloat(minPrice));
    }
  
    if (maxPrice) {
      filtered = filtered.filter((rate) => rate.retailPrice <= parseFloat(maxPrice));
    }
  
   
    setFilteredRates(filtered);
  };
  
  const resetFilters = () => {
    setFilterText("");
    setMinPrice("");
    setMaxPrice("");
    
    setFilteredRates([]);
  };
  //pagination logic
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = (filteredRates.length > 0 ? filteredRates : rates).slice(firstIndex, lastIndex);
  const totalPages = Math.ceil((filteredRates.length > 0 ? filteredRates : rates).length / itemsPerPage);

  // Functions for pagination controls
  const nextPage = () => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  const prevPage = () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1));


  // Export to Excel function
const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(filteredRates.length > 0 ? filteredRates : rates);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Azure Rates");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, "AzureRates.xlsx");
};

  return (
    <div className="container" >
    
      <h1>Azure Rates</h1>
        <p>Stay informed with the latest Azure retail prices across regions and currencies, helping you make cost-effective decisions for your cloud services</p>
      <div className="filter-container">
  <input
    type="text"
    placeholder="Product Name"
    onChange={(e) => setFilterText(e.target.value)}
  />
  <input
    type="number"
    placeholder="Min Price"
    onChange={(e) => setMinPrice(e.target.value)}
  />
  <input
    type="number"
    placeholder="Max Price"
    onChange={(e) => setMaxPrice(e.target.value)}
  />

  <button onClick={applyFilters}>Apply Filters</button>
  <button onClick={resetFilters}>Reset</button>
  
  <button className="export-btn" onClick={exportToExcel}>
          Export to Excel
        </button>
  
</div>


      
      {loading ? (
        <p>Loading data...</p>
      ) : (
      <>
        <table >
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Sku ID</th>
              <th>Sku Name</th>
              <th>Service ID</th>
              <th>Service Name</th>
              <th>Service Family</th>
              <th>Unit of Measure</th>
              <th>Unit Price</th>
              <th>Retail Price</th>
              <th>Currency Code</th>
              <th>Tier Minimum Units</th>
              
              <th>Arm Region Name</th>
              <th>Arm Sku name</th>
              <th>Location</th>
              <th>Effective Start Date</th>
              <th>Meter Id</th>
              <th>Meter Name</th>
              <th>Is Primary Meter Region</th>
              <th>Type</th>
              
            </tr>
          </thead>
          <tbody>
            {currentItems.slice(0, 100).map((rate, index) => (
              <tr key={index}>
                <td>{rate.productId}</td>
                <td>{rate.productName}</td>
                <td>{rate.skuId}</td>
                <td>{rate.skuName}</td>
                <td>{rate.serviceId}</td>
                <td>{rate.serviceName}</td>
                <td>{rate.serviceFamily}</td>
                <td>{rate.unitOfMeasure}</td>
                <td>{rate.unitPrice}</td>
                <td>{rate.retailPrice}</td>
                <td>{rate.currencyCode}</td>
                <td>{rate.tierMinimumUnits}</td>
                <td>{rate.armRegionName}</td>
                <td>{rate.armSkuName}</td>
                <td>{rate.location}</td>
                <td>{rate.effectiveStartDate}</td>
                <td>{rate.meterId}</td>
                <td>{rate.meterName}</td>
                <td>{rate.isPrimaryMeterRegion}</td>
                <td>{rate.type}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
            <button className="page-btn" onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button className="page-btn" onClick={nextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
      </>  
      )}
    </div>
  );
}

export default App;
