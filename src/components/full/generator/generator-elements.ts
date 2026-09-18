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
			x="${config.wide ? '30%' : '3%'}"
			y="2.5%"
		>
			<!-- Generator source box -->
			<rect
				x="374"
				y="20"
				width="70"
				height="55"
				rx="4.5"
				ry="4.5"
				fill="none"
				stroke="${colour}"
				pointer-events="all"
			/>

			${renderText(
				'generator_name',
				409,
				83,
				!showGenerator,
				'st3 st8',
				colour,
				config.generator.name || 'Generator',
				true,
			)}

			<!-- Generator -> inverter flow. The path is deliberately source-to-inverter. -->
			<svg id="generator-flow">
				${renderPath(
					'generator-line',
					config.wide
						? 'M 374 47 L 307 47 L 237 47'
						: 'M 374 47 L 307 47 L 237 47',
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
				@click=${(e) => Utils.handlePopup(e, config.entities.generator_status)}
			>
				${renderIcon(
					undefined,
					'mdi:generator-mobile',
					generatorOn ? 'generator-icon' : 'generator-off-icon',
					374,
					10,
					70,
					70,
				)}
			</a>

			${config.entities?.generator_power
				? createTextWithPopup(
						'generator_power',
						409,
						48,
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
				374,
				12,
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
