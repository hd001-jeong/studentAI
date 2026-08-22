import ApiClient from "@/api/ApiClient";

export interface NoticeResponse {
  schoolName: string;
  grade: string;
  weekLabel: string;
  notice: string;
}

export interface NoticeUpdateRequest {
  schoolName: string;
  grade: string;
  weekLabel: string;
  notice: string;
}

export interface NoticeHistoryItem {
  weekLabel: string;
  notice: string;
}

const NoticeApi = {
  getWeeks: async (schoolName: string, grade: string): Promise<string[]> => {
    const response = await ApiClient.get<string[]>("/notices/weeks", {
      params: {
        schoolName,
        grade,
      },
    });

    return response.data;
  },

  getHistory: async (
    schoolName: string,
    grade: string,
  ): Promise<NoticeHistoryItem[]> => {
    const response = await ApiClient.get<NoticeHistoryItem[]>(
      "/notices/history",
      {
        params: {
          schoolName,
          grade,
        },
      },
    );

    return response.data;
  },

  getNotice: async (
    schoolName: string,
    grade: string,
    weekLabel: string,
  ): Promise<NoticeResponse> => {
    const response = await ApiClient.get<NoticeResponse>("/notices", {
      params: {
        schoolName,
        grade,
        weekLabel,
      },
    });

    return response.data;
  },

  updateNotice: async (
    request: NoticeUpdateRequest,
  ): Promise<NoticeResponse> => {
    const response = await ApiClient.put<NoticeResponse>("/notices", request);

    return response.data;
  },
};

export default NoticeApi;
