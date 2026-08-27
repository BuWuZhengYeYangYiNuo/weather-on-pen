// Copyright (C) 2025 Template Author
//
// This file is part of miniapp-template.
//
// miniapp-template is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// miniapp-template is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with miniapp-template.  If not, see <https://www.gnu.org/licenses/>.

import { defineComponent } from 'vue';
import { fetchWeather, WeatherApiException, WeatherData } from '../../weatherApi';
import { getWeatherIcon } from '../../weatherIconMap';

export type indexOptions = {};

// 预设城市：词典笔无物理键盘，用按钮快速切换（也可按需增删）
const PRESET_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'];

const index = defineComponent({
    data() {
        return {
            $page: {} as FalconPage<indexOptions>,
            loading: false,
            error: '',
            lastQuery: '',
            icon: '',
            temperature: null as number | null,
            weather: '',
            windDirection: '',
            windPower: '',
            humidity: null as number | null,
            aqi: null as number | null,
            aqiCategory: '',
            reportTime: '',
            placeLabel: '',
            presetCities: PRESET_CITIES,
            initialized: false,
        };
    },

    computed: {
        displayTemp(): string {
            return this.temperature != null ? `${this.temperature}°` : '--';
        },
        weatherText(): string {
            return this.weather || '未知';
        },
        windText(): string {
            const t = `${this.windDirection || ''} ${this.windPower || ''}`.trim();
            return t || '未知';
        },
        humidityText(): string {
            return this.humidity != null ? `${this.humidity}%` : '--';
        },
        aqiText(): string {
            if (this.aqi == null) return '';
            return `空气 ${this.aqiCategory || ''} (${this.aqi})`;
        },
        cityLabel(): string {
            return this.placeLabel || '自动定位';
        },
        updateText(): string {
            if (!this.reportTime) return '';
            const t = this.reportTime.split(' ')[1];
            return t ? `更新 ${t}` : '';
        },
    },

    methods: {
        /**
         * 查询天气。city 为空时走 IP 自动定位。
         */
        async query(city?: string) {
            this.loading = true;
            this.error = '';
            this.lastQuery = city || '';
            try {
                const data: WeatherData = await fetchWeather({ city: city || undefined, extended: true });
                this.icon = getWeatherIcon(data.weather_icon);
                this.temperature = data.temperature ?? null;
                this.weather = data.weather || '';
                this.windDirection = data.wind_direction || '';
                this.windPower = data.wind_power || '';
                this.humidity = data.humidity ?? null;
                this.aqi = data.aqi ?? null;
                this.aqiCategory = data.aqi_category || '';
                this.reportTime = data.report_time || '';
                this.placeLabel = [data.city, data.district].filter(Boolean).join('·') || data.province || '';
            } catch (err) {
                this.error = err instanceof WeatherApiException
                    ? `${err.code}: ${err.message}`
                    : `请求失败：${String(err)}`;
            } finally {
                this.loading = false;
            }
        },

        queryCity(city: string) {
            this.query(city);
        },

        refresh() {
            this.query(this.lastQuery);
        },

        /**
         * 页面生命周期：页面进入前台（由 base-page.js 的 onShow 代理）。
         * 仅在首次进入时自动按 IP 定位一次，避免失败/反复切前台时频繁重试；
         * 之后可手动点「定位」或「刷新」重新查询。
         */
        onShow() {
            if (!this.initialized && !this.loading) {
                this.initialized = true;
                this.query('');
            }
        },
    },
});

export default index;
