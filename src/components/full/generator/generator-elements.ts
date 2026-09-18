import { html } from 'lit';
import { Utils } from '../../../helpers/utils';
import { DataDto, sunsynkPowerFlowCardConfig } from '../../../types';
import { UnitOfPower } from '../../../const';
import { createTextWithPopup, renderText } from '../../../helpers/text-utils';
import { renderIcon } from '../../../helpers/render-icon';
import { renderPath } from '../../../helpers/render-path';
import { renderCircle } from '../../../helpers/render-circle';

/**
 * First-class generator source for the full card.
 *
 * The generator is intentionally modelled as a source feeding the inverter,
 * rather than as an AUX load. This keeps flow direction unambiguous and
 * leaves the existing AUX implementation untouched.
 */
export const renderGeneratorElements = (
	data: DataDto,
	config: sunsynkPowerFlowCardConfig,
) => {
	const {
		showGenerator,
		showDailyGenerator,
		generatorPower,
		generatorStatus,
		generatorDynamicColour,
		generatorLineWidth,
		largeFont,
		decimalPlaces,
	} = data;

	const generatorOn =
		['on', '1', 'true', 'running'].includes(
			String(generatorStatus ?? '').toLowerCase(),
		) || generatorPower > (config.generator.off_threshold ?? 0);

	const colour = generatorOn
		? generatorDynamicColour
		: data.generatorOffColour;

	return html`
		<svg
			id="Generator"
			style="overflow: visible; display: ${!showGenerator ? 'none' : 'inline'};"
			x="${config.wide ? '20%' : '3%'}"
			y="-5%"
		>
			${renderText(
				'generator_name',
				180,
				44,
				!showGenerator,
				'st3 st8',
				colour,
				config.generator.name || 'Generator',
				true,
			)}

			<!-- Generator power box -->
			<rect
				x="145"
				y="72"
				width="70"
				height="30"
				rx="4.5"
				ry="4.5"
				fill="none"
				stroke="${colour}"
				pointer-events="all"
			/>

			<!-- Generator -> inverter flow. The path is deliberately source-to-inverter. -->
			<svg id="generator-flow">
				${renderPath(
					'generator-line',
					config.wide
						? 'M 180 102 L 180 138 Q 180 148 170 148 L 125 148 Q 115 148 115 158 L 115 187'
						: 'M 180 102 L 180 138 Q 180 148 170 148 L 125 148 Q 115 148 115 158 L 115 187',
					showGenerator,
					generatorDynamicColour,
					generatorLineWidth,
				)}
				${renderCircle(
					'generator-dot',
					Math.min(
						2 + generatorLineWidth + Math.max(data.minLineWidth - 2, 0),
						8,
					),
					generatorPower > 0 ? generatorDynamicColour : 'transparent',
					data.durationCur['generator'],
					'0;1',
					'#generator-line',
				)}
			</svg>

			<a
				href="#"
				@click=${(e) =>
					Utils.handlePopup(
						e,
						config.entities.generator_status || config.entities.generator_power,
					)}
			>
				${renderIcon(
					undefined,
					'mdi:generator-mobile',
					generatorOn ? 'generator-icon' : 'generator-off-icon',
					168,
					47,
					24,
					24,
				)}
			</a>

			${config.entities?.generator_power
				? createTextWithPopup(
						'generator_power',
						180,
						91,
						!showGenerator,
						`${largeFont !== true ? 'st14' : 'st4'} st8`,
						colour,
						config.generator.auto_scale
							? Utils.convertValue(generatorPower, decimalPlaces) || '0'
							: `${generatorPower || 0} ${UnitOfPower.WATT}`,
						(e) => Utils.handlePopup(e, config.entities.generator_power),
						true,
					)
				: ''}

			${createTextWithPopup(
				'generator_daily_value',
				180,
				30,
				!showGenerator ||
					!showDailyGenerator ||
					!data.stateGeneratorDailyEnergy.isValid(),
				'st10 left-align',
				colour,
				data.stateGeneratorDailyEnergy.toPowerString(
					true,
					data.decimalPlacesEnergy,
				),
				(e) =>
					Utils.handlePopup(e, config.entities.generator_daily_energy),
				true,
			)}
		</svg>
	`;
};
