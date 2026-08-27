<!--
 Copyright (C) 2025 Template Author

 This file is part of miniapp-template.

 miniapp-template is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 miniapp-template is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with miniapp-template.  If not, see <https://www.gnu.org/licenses/>.
-->

<template>
    <div class="container">
        <div class="header">
            <text class="city">{{ cityLabel }}</text>
            <text class="update">{{ updateText }}</text>
        </div>

        <div class="main">
            <div class="icon-box">
                <figure v-if="icon" :src="icon" class="icon" resize="contain"></figure>
            </div>
            <div class="info">
                <text class="temp">{{ displayTemp }}</text>
                <text class="weather">{{ weatherText }}</text>
                <text class="meta">风 {{ windText }}</text>
                <text class="meta">湿度 {{ humidityText }}</text>
                <text class="meta aqi" v-if="aqiText">{{ aqiText }}</text>
            </div>
        </div>

        <div class="city-bar">
            <text class="bar-label">城市</text>
            <div class="chips">
                <Button class="chip" @click="queryCity('')">定位</Button>
                <Button
                    class="chip"
                    v-for="c in presetCities"
                    :key="c"
                    @click="queryCity(c)"
                >{{ c }}</Button>
            </div>
        </div>

        <div class="footer">
            <text v-if="loading" class="status">加载中…</text>
            <text v-else-if="error" class="status err">{{ error }}</text>
            <Button class="chip refresh" @click="refresh">刷新</Button>
        </div>
    </div>
</template>

<style lang="less" scoped>
.container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #1b1b1b;
    padding: 12px;
    display: flex;
    flex-direction: column;
}
.header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}
.city {
    font-size: 24px;
    color: #ffffff;
    font-weight: bold;
}
.update {
    font-size: 16px;
    color: #999999;
}
.main {
    display: flex;
    flex-direction: row;
    flex: 1;
}
.icon-box {
    width: 220px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.icon {
    width: 160px;
    height: 160px;
}
.info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 8px;
}
.temp {
    font-size: 66px;
    color: #ffffff;
}
.weather {
    font-size: 26px;
    color: #ffd866;
    margin-top: 4px;
}
.meta {
    font-size: 18px;
    color: #cccccc;
    margin-top: 4px;
}
.aqi {
    color: #66ccff;
}
.city-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 8px;
}
.bar-label {
    font-size: 16px;
    color: #888888;
    margin-right: 8px;
}
.chips {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}
.chip {
    margin-right: 8px;
    padding: 4px 10px;
}
.footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
}
.status {
    font-size: 16px;
    color: #cccccc;
}
.err {
    color: #ff6b6b;
}
</style>

<script>
import index from './index';
export default index;
</script>
