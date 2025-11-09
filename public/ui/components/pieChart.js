// public/ui/components/pieChart.js

import { translate } from '../../i18n.js';

export function drawPieChart(elementId, title, data, colors, options = {}) {
    const chartElement = document.getElementById(elementId);
    if (!chartElement) return;

    const parentBox = chartElement.parentElement;
    const existingLegend = parentBox.querySelector('.custom-legend-wrapper');
    if (existingLegend) {
        parentBox.removeChild(existingLegend);
    }

    const header = data[0];
    const body = data.slice(1);
    const realTotal = body.reduce((sum, row) => sum + row[1], 0);

    chartElement.innerHTML = '';

    if (realTotal === 0) {
        chartElement.innerHTML = `<div class="chart-title" style="text-align:center;font-weight:bold;color:#666;padding-top:20px;">${title}</div><div class="no-data-text" style="text-align:center;padding-top:50px;color:#999;">${translate('no_data_to_display')}</div>`;
        return;
    }

    const chartDataForDrawing = [header, ...body.map(row => [row[0], row[1]])];
    chartDataForDrawing.push(['', realTotal]);

    const dataTable = google.visualization.arrayToDataTable(chartDataForDrawing);
    const dummySliceIndex = chartDataForDrawing.length - 2;
    
    const chartOptions = {
        title,
        pieHole: 0.4,
        colors,
        legend: 'none',
        pieStartAngle: -90,
        width: '100%',
        height: '100%',
        chartArea: { left: '5%', top: '10%', width: '90%', height: '80%' },
        tooltip: { trigger: 'none' },
        pieSliceText: 'percentage',
        pieSliceTextStyle: { color: 'white', fontSize: 12 },
        slices: { [dummySliceIndex]: { color: 'transparent' } }
    };
    new google.visualization.PieChart(chartElement).draw(dataTable, chartOptions);


    const legendWrapper = document.createElement('div');
    legendWrapper.className = 'custom-legend-wrapper';

    const legendList = document.createElement('ul');
    legendList.className = 'legend-list';
    
    body.forEach((row, index) => {
        const [label, value, stats] = row;
        const color = colors[index % colors.length];
        const listItem = document.createElement('li');
        listItem.className = 'legend-item';

        const valueText = (options.useFractionalLegend && stats)
            ? `${stats.count}/${stats.total}`
            : `${Number.isInteger(value) ? value : value.toFixed(1)}`;
        
        listItem.innerHTML = `
            <span class="legend-marker" style="background-color: ${color};"></span>
            <span class="legend-label">${label.replace(/\n/g, ' ').replace(/\|/g, '')}</span>
            <span class="legend-value">${valueText}</span>
        `;

        legendList.appendChild(listItem);
    });
    legendWrapper.appendChild(legendList);

    if (options.description) {
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'legend-description';
        descriptionElement.innerHTML = options.description.replace(/\n/g, '<br>');
        legendWrapper.appendChild(descriptionElement);
    }
    
    parentBox.appendChild(legendWrapper);
}