// public/ui/components/pieChart.js

import { translate } from '../../i18n.js';
import { openModal } from '../modal.js'; 

export function drawPieChart(elementId, title, data, colors, options = {}) {
    const chartElement = document.getElementById(elementId);
    if (!chartElement) return;

    // グラフコンテナに必要なクラスを追加し、タイトル要素を挿入
    chartElement.classList.add('pie-chart-container');
    chartElement.innerHTML = `<h4 class="chart-title">${title}</h4>`;

    const parentBox = chartElement.parentElement;
    const existingLegend = parentBox.querySelector('.custom-legend-wrapper');
    if (existingLegend) {
        parentBox.removeChild(existingLegend);
    }

    const header = data[0];
    const body = data.slice(1);
    const realTotal = body.reduce((sum, row) => sum + row[1], 0);

    if (realTotal === 0) {
        chartElement.innerHTML += `<div class="no-data-text" style="text-align:center;padding-top:50px;color:#999;">${translate('no_data_to_display')}</div>`;
        return;
    }

    // Google Chartsを描画するための新しいdivを作成し、コンテナに追加
    const googleChartDiv = document.createElement('div');
    googleChartDiv.className = 'google-chart-div';
    chartElement.appendChild(googleChartDiv);


    const chartDataForDrawing = [header, ...body.map(row => [row[0], row[1]])];
    chartDataForDrawing.push(['', realTotal]);

    const dataTable = google.visualization.arrayToDataTable(chartDataForDrawing);
    const dummySliceIndex = chartDataForDrawing.length - 2;
    
    const chartOptions = {
        // titleオプションはCSSで制御するため削除
        pieHole: 0.4,
        colors,
        legend: 'none',
        pieStartAngle: -90,
        width: '100%',
        height: '100%',
        // chartAreaを広げてグラフを大きくする
        chartArea: { left: '5%', top: '5%', width: '90%', height: '90%' }, 
        tooltip: { trigger: 'none' },
        pieSliceText: 'percentage',
        pieSliceTextStyle: { color: 'white', fontSize: 12 },
        slices: { [dummySliceIndex]: { color: 'transparent' } },
    };
    new google.visualization.PieChart(googleChartDiv).draw(dataTable, chartOptions);


    const legendWrapper = document.createElement('div');
    legendWrapper.className = 'custom-legend-wrapper';

    const legendList = document.createElement('ul');
    legendList.className = 'legend-list';
    
    if (body.length === 3) {
        legendList.classList.add('legend-list-3-items');
    }

    const positionClasses = ['bottom-left', 'top-center', 'bottom-right'];

    body.forEach((row, index) => {
        const [label, value, stats] = row;
        const color = colors[index % colors.length];
        const listItem = document.createElement('li');
        
        if (body.length === 3) {
            const positionClass = positionClasses[index] || '';
            listItem.className = `legend-item legend-item-${positionClass}`;
        } else {
            listItem.className = 'legend-item';
        }

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
        const button = document.createElement('button');
        button.className = 'explanation-button pie-chart-exp-button';
        button.textContent = translate('show_explanation_button', {default: '解説'});
        button.onclick = () => {
            const chartTitleText = title.split('(')[0].trim(); // タイトルから(xx)などを除去
            openModal(chartTitleText, options.description);
        };
        legendWrapper.appendChild(button);
    }
    
    parentBox.appendChild(legendWrapper);
}