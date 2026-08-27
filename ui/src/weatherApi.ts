// Weather API client for uapis.cn (UAPI)
// 文档：https://uapis.cn/docs/api-reference/get-misc-weather
// 完整地址：https://uapis.cn/api/v1/misc/weather
//
// 说明：
// - 本项目不需要 API Key，鉴权头默认不携带；若将来需要，可在下方 WEATHER_API_KEY 填入以 `uapi-` 开头的密钥。
// - 仅按文档实现最小可用接入：参数、返回结构、错误码均以文档为准。

export interface AirPollutants {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
}

export interface WeatherAlert {
    title?: string;
    type?: string;
    level?: string;
    text?: string;
    publish_time?: string;
    publisher?: string;
    guidance?: string[];
}

export interface ForecastItem {
    date?: string;
    week?: string;
    temp_max?: number;
    temp_min?: number;
    weather_day?: string;
    weather_night?: string;
    wind_dir_day?: string;
    wind_dir_night?: string;
    wind_scale_day?: string;
    wind_scale_night?: string;
    wind_speed_day?: number;
    humidity?: number;
    precip?: number;
    visibility?: number;
    uv_index?: number;
    sunrise?: string;
    sunset?: string;
}

export interface HourlyItem {
    time?: string;
    temperature?: number;
    weather?: string;
    wind_direction?: string;
    wind_speed?: number;
    wind_scale?: string;
    humidity?: number;
    precip?: number;
    feels_like?: number;
    visibility?: number;
    pop?: number;
    uv_index?: number;
}

export interface MinutelyPrecip {
    summary?: string;
    update_time?: string;
    data?: { time?: string; precip?: number; type?: string }[];
}

export interface LifeIndexItem {
    level?: string;
    brief?: string;
    advice?: string;
}

export interface LifeIndices {
    clothing?: LifeIndexItem;
    uv?: LifeIndexItem;
    car_wash?: LifeIndexItem;
    drying?: LifeIndexItem;
    air_conditioner?: LifeIndexItem;
    cold_risk?: LifeIndexItem;
    exercise?: LifeIndexItem;
    comfort?: LifeIndexItem;
    travel?: LifeIndexItem;
    fishing?: LifeIndexItem;
    allergy?: LifeIndexItem;
    sunscreen?: LifeIndexItem;
    mood?: LifeIndexItem;
    beer?: LifeIndexItem;
    umbrella?: LifeIndexItem;
    traffic?: LifeIndexItem;
    air_purifier?: LifeIndexItem;
    pollen?: LifeIndexItem;
}

export interface WeatherData {
    province?: string;
    city?: string;
    district?: string;
    adcode?: string;
    weather?: string;
    weather_icon?: string;
    temperature?: number;
    wind_direction?: string;
    wind_power?: string;
    humidity?: number;
    report_time?: string;

    feels_like?: number;
    visibility?: number;
    pressure?: number;
    uv?: number;
    precipitation?: number;
    cloud?: number;
    aqi?: number;
    aqi_level?: number;
    aqi_category?: string;
    aqi_primary?: string;
    air_pollutants?: AirPollutants;
    alerts?: WeatherAlert[];

    temp_max?: number;
    temp_min?: number;
    forecast?: ForecastItem[];
    hourly_forecast?: HourlyItem[];
    minutely_precip?: MinutelyPrecip;
    life_indices?: LifeIndices;
}

export interface WeatherError {
    code: string;
    message: string;
}

export type WeatherResult = WeatherData | WeatherError;

export interface WeatherQuery {
    city?: string;
    adcode?: string;
    extended?: boolean;
    forecast?: boolean;
    hourly?: boolean;
    minutely?: boolean;
    indices?: boolean;
    lang?: 'zh' | 'en';
}

// 鉴权：本项目无需填写。若需鉴权，填入以 `uapi-` 开头的密钥，请求将自动携带 `Authorization: Bearer <KEY>`。
const WEATHER_API_KEY = '';

const BASE_URL = 'https://uapis.cn/api/v1/misc/weather';

const DEFAULT_TIMEOUT = 8000;

/**
 * 从 $falcon 中安全地取出请求函数（框架同时暴露 net.request / http.request，做一次兼容）。
 */
function getRequestFn(): (params: any) => Promise<any> {
    const falcon: any = (globalThis as any).$falcon;
    const jsapi: any = falcon?.jsapi;
    const fn = jsapi?.net?.request || jsapi?.http?.request;
    if (typeof fn !== 'function') {
        throw new Error('当前运行环境缺少网络请求能力（$falcon.jsapi.net/http.request）');
    }
    return fn.bind(jsapi);
}

function isValidLang(lang?: string): lang is 'zh' | 'en' {
    return lang === undefined || lang === 'zh' || lang === 'en';
}

/**
 * 组装查询字符串。GET 参数手工拼接到 URL（文档为 GET 接口）。
 * 不依赖 URLSearchParams，以兼容定制 JS 运行时（如词典笔 falcon）。
 */
function buildUrl(query: WeatherQuery): string {
    const pairs: string[] = [];
    const add = (k: string, v: string) => {
        pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    };
    if (query.city != null && query.city !== '') {
        add('city', query.city);
    }
    if (query.adcode != null && query.adcode !== '') {
        add('adcode', query.adcode);
    }
    if (query.extended) {
        add('extended', 'true');
    }
    if (query.forecast) {
        add('forecast', 'true');
    }
    if (query.hourly) {
        add('hourly', 'true');
    }
    if (query.minutely) {
        add('minutely', 'true');
    }
    if (query.indices) {
        add('indices', 'true');
    }
    if (query.lang != null && query.lang !== 'zh') {
        add('lang', query.lang);
    }
    const qs = pairs.join('&');
    return qs ? `${BASE_URL}?${qs}` : BASE_URL;
}

export class WeatherApiException extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.name = 'WeatherApiException';
        this.code = code;
    }
}

/**
 * 查询天气。返回解析后的 WeatherData；出错时抛出 WeatherApiException。
 */
export async function fetchWeather(query: WeatherQuery = {}): Promise<WeatherData> {
    // 参数校验：lang 非法（文档仅支持 zh / en）
    if (!isValidLang(query.lang)) {
        throw new WeatherApiException('INVALID_PARAMETER', 'lang 仅支持 zh 或 en');
    }

    const url = buildUrl(query);
    const headers: Record<string, string> = {};
    if (WEATHER_API_KEY && WEATHER_API_KEY.startsWith('uapi-')) {
        headers['Authorization'] = `Bearer ${WEATHER_API_KEY}`;
    }

    let res: any;
    try {
        const requestFn = getRequestFn();
        res = await requestFn({
            url,
            method: 'GET',
            headers,
            timeout: DEFAULT_TIMEOUT,
        });
    } catch (err) {
        // 网络异常 / 超时 / 请求被拒
        throw new WeatherApiException('NETWORK_ERROR', `网络请求失败：${String(err && (err.message || err))}`);
    }

    // 兼容不同返回结构：有的实现把业务数据放在 data.data，有的直接是 data
    const statusCode: number = res?.statusCode ?? 0;
    let body: any = res?.data ?? res;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (_e) {
            // 保持原字符串，交由后续逻辑处理
        }
    }

    // 非 2xx：优先解析 { code, message } 错误体
    if (statusCode < 200 || statusCode >= 300) {
        const errBody = typeof body === 'object' && body !== null ? body : {};
        const code = errBody.code || `HTTP_${statusCode}`;
        const message = errBody.message || `请求失败（HTTP ${statusCode}）`;
        throw new WeatherApiException(code, message);
    }

    // 2xx：尝试从响应中取出业务数据
    const data: any = body?.data ?? body;
    if (!data || typeof data !== 'object') {
        throw new WeatherApiException('EMPTY_RESPONSE', '返回数据为空或格式异常');
    }
    return data as WeatherData;
}

export default fetchWeather;
