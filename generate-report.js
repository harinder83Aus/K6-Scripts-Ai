#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateSimpleHTMLReport(jsonFile, outputFile) {
    try {
        console.log(`Reading JSON results from: ${jsonFile}`);
        const jsonData = fs.readFileSync(jsonFile, 'utf8');
        
        // Parse line by line since it's NDJSON (newline-delimited JSON)
        const lines = jsonData.trim().split('\n');
        const metrics = [];
        let testInfo = {
            startTime: null,
            endTime: null,
            scenarios: new Set(),
            vus: 0,
            iterations: 0,
            requests: 0,
            errors: 0
        };

        lines.forEach(line => {
            try {
                const entry = JSON.parse(line);
                if (entry.type === 'Point') {
                    if (entry.metric === 'vus' && entry.data.value > testInfo.vus) {
                        testInfo.vus = entry.data.value;
                    }
                    if (entry.metric === 'iterations') {
                        testInfo.iterations++;
                    }
                    if (entry.metric === 'http_reqs') {
                        testInfo.requests++;
                    }
                    if (entry.metric === 'http_req_failed' && entry.data.value > 0) {
                        testInfo.errors++;
                    }
                    if (!testInfo.startTime) {
                        testInfo.startTime = entry.data.time;
                    }
                    testInfo.endTime = entry.data.time;
                }
            } catch (e) {
                // Skip invalid JSON lines
            }
        });

        // Generate HTML report
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K6 Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .metric-card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .error { border-left-color: #dc3545; }
        .info { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 K6 Load Test Report</h1>
        
        <div class="info">
            <strong>Test Generated:</strong> ${new Date().toLocaleString()}<br>
            <strong>Test Duration:</strong> ${testInfo.startTime && testInfo.endTime ? 
                Math.round((new Date(testInfo.endTime) - new Date(testInfo.startTime)) / 1000) + ' seconds' : 'N/A'}<br>
            <strong>Source File:</strong> ${jsonFile}
        </div>

        <h2>📊 Test Metrics</h2>
        <div class="grid">
            <div class="metric-card success">
                <div class="metric-value">${testInfo.vus}</div>
                <div class="metric-label">Peak Virtual Users</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${testInfo.iterations}</div>
                <div class="metric-label">Total Iterations</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${testInfo.requests}</div>
                <div class="metric-label">HTTP Requests</div>
            </div>
            <div class="metric-card ${testInfo.errors > 0 ? 'error' : 'success'}">
                <div class="metric-value">${testInfo.errors}</div>
                <div class="metric-label">Failed Requests</div>
            </div>
        </div>

        <h2>📈 Test Summary</h2>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Test File</td>
                    <td>${jsonFile}</td>
                    <td>✅ Completed</td>
                </tr>
                <tr>
                    <td>Peak VUs</td>
                    <td>${testInfo.vus}</td>
                    <td>✅ Recorded</td>
                </tr>
                <tr>
                    <td>Iterations</td>
                    <td>${testInfo.iterations}</td>
                    <td>✅ Recorded</td>
                </tr>
                <tr>
                    <td>HTTP Requests</td>
                    <td>${testInfo.requests}</td>
                    <td>✅ Recorded</td>
                </tr>
                <tr>
                    <td>Error Rate</td>
                    <td>${testInfo.requests > 0 ? ((testInfo.errors / testInfo.requests) * 100).toFixed(2) : 0}%</td>
                    <td>${testInfo.errors === 0 ? '✅ No Errors' : '⚠️ Some Errors'}</td>
                </tr>
            </tbody>
        </table>

        <h2>📋 Test Details</h2>
        <div class="info">
            <strong>Note:</strong> This is a basic HTML report generated from K6 JSON results. 
            For more detailed analysis, consider using the full K6 HTML reporter or importing results into your preferred analysis tool.
        </div>

        <div class="footer">
            Generated by K6 Simple HTML Reporter | ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync(outputFile, html);
        console.log(`✅ HTML report generated: ${outputFile}`);
        
        // Show file size
        const stats = fs.statSync(outputFile);
        console.log(`📊 Report size: ${(stats.size / 1024).toFixed(2)} KB`);
        
    } catch (error) {
        console.error('❌ Error generating report:', error.message);
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node generate-report.js <json-file> <output-file>');
    process.exit(1);
}

const jsonFile = args[0];
const outputFile = args[1];

generateSimpleHTMLReport(jsonFile, outputFile);