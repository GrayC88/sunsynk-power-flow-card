import { html } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { keyed } from 'lit/directives/keyed.js';
import { DataDto, sunsynkPowerFlowCardConfig } from '../types';
import { getDynamicStyles } from '../style';
import { renderSolarElements } from '../components/full/pv/pv_elements';
import { renderBatteryElements } from '../components/full/bat/bat-elements';
import { renderGridElements } from '../components/full/grid/grid-elements';
import { renderLoadElements } from '../components/full/load/load-elements';
import { renderAuxLoadElements } from '../components/full/auxload/aux-elements';
import { renderGeneratorElements } from '../components/full/generator/generator-elements';
import { renderInverterElements } from '../components/full/inverter/inverter-elements';
import { renderPath } from '../helpers/render-path';
import { renderCircle } from '../helpers/render-circle';

export const fullCard = (
	config: sunsynkPowerFlowCardConfig,
	inverterImg: string,
	data: DataDto,
) => {
	const titleKey = config.title
		? `${config.title}|${config.title_colour ?? ''}|${config.title_size ?? ''}`
		: 'no-title';
	const titleTemplate = config.title
		? cache(
				keyed(
					titleKey,
					html`<h1
						style="text-align: center; color: ${config.title_colour ||
						'inherit'}; font-size: ${config.title_size || '32px'};"
					>
						${config.title}
					</h1>`,
				),
			)
		: '';
	return html`
		<ha-card>
			${getDynamicStyles(data)}
			<div class="container card">
				${titleTemplate}
				<svg
					viewBox="${config.wide ? '0 0 720 405' : '0 0 483 405'}"
					preserveAspectRatio="xMidYMid meet"
					height="${data.cardHeight}"
					width="${data.cardWidth}"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
				>
					<!-- Solar Elements -->
					${renderSolarElements(data, config)}

					<!-- Battery Elements -->
					${renderBatteryElements(data, config)}

					<!-- Grid Elements -->
					${renderGridElements(data, config)}

					<!-- Load Elements -->
					${renderLoadElements(data, config)}

					<!-- Generator Elements -->
					${renderGeneratorElements(data, config)}

					<!-- Generator flow is rendered in the full-card coordinate space so
					     moving the generator block does not move the inverter endpoint. -->
					<svg
						id="generator-flow"
						style="overflow: visible; display: ${!data.showGenerator ? 'none' : 'inline'};"
					>
						${renderPath(
							'generator-line',
							config.wide
								? 'M 223 77 L 223 171 Q 223 181 233 181 L 289 181'
								: 'M 209 77 L 209 167 Q 209 177 219 177 L 289 177',
							data.showGenerator,
							data.generatorDynamicColour,
							data.generatorLineWidth,
						)}
						${renderCircle(
							'generator-dot',
							Math.min(
								2 + data.generatorLineWidth + Math.max(data.minLineWidth - 2, 0),
								8,
							),
							data.generatorPower > 0
								? data.generatorDynamicColour
								: 'transparent',
							data.durationCur['generator'],
							'0;1',
							'#generator-line',
						)}
					</svg>

					<!-- AUX Elements -->
					${renderAuxLoadElements(data, config)}

					<!-- Inverter Elements -->
					${renderInverterElements(data, inverterImg, config)}
				</svg>
			</div>
		</ha-card>
	`;
};
