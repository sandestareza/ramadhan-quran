import axios from 'axios';
import type { ApiResponse, Surah, SurahDetail, TafsirData, Doa, DoaApiResponse, JadwalSholatResponse } from '@/types';

const api = axios.create({
  baseURL: 'https://equran.id/api/v2',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const quranApi = {
  // Get all surahs
  getSurahList: async (): Promise<Surah[]> => {
    const { data } = await api.get<ApiResponse<Surah[]>>('/surat');
    return data.data;
  },

  // Get surah detail with ayat
  getSurahDetail: async (nomor: number): Promise<SurahDetail> => {
    const { data } = await api.get<ApiResponse<SurahDetail>>(`/surat/${nomor}`);
    return data.data;
  },

  // Get tafsir for a surah
  getTafsir: async (nomor: number): Promise<TafsirData> => {
    const { data } = await api.get<ApiResponse<TafsirData>>(`/tafsir/${nomor}`);
    return data.data;
  },

  // Get all doa
  getDoaList: async (): Promise<Doa[]> => {
    const { data } = await axios.get<DoaApiResponse>('https://equran.id/api/doa');
    return data.data;
  },

  // Shalat - Get province list
  getProvinsiList: async (): Promise<string[]> => {
    const { data } = await api.get<ApiResponse<string[]>>('/shalat/provinsi');
    return data.data;
  },

  // Shalat - Get kabupaten/kota list
  getKabKotaList: async (provinsi: string): Promise<string[]> => {
    const { data } = await api.post<ApiResponse<string[]>>('/shalat/kabkota', { provinsi });
    return data.data;
  },

  // Shalat - Get monthly schedule
  getJadwalSholat: async (provinsi: string, kabkota: string, bulan: number, tahun: number): Promise<JadwalSholatResponse> => {
    const { data } = await api.post<ApiResponse<JadwalSholatResponse>>('/shalat', { provinsi, kabkota, bulan, tahun });
    return data.data;
  },
};

export default api;

