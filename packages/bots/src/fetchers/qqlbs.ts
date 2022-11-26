import http from 'got';
import { setTimeout } from 'timers/promises'

import { ILocation } from '@cdata/common/types/location';

const { QQLBS_KEY } = process.env;
const QPS = 4;

interface IResult<T> {
  status: number;
  message: string;
  result?: T;
}

interface IGeocoder {
  ad_info: {
    adcode: string;
  };
  address_components: {
    city: string;
    district: string;
    province: string;
    street: string;
    street_number: string;
  };
  deviation: number;
  level: number;
  location: ILocation;
  reliability: number;
  similarity: number;
  title: string;
}

export async function geocode(address: string): Promise<ILocation | undefined> {
  if (!QQLBS_KEY) return;
  const { result } = await http.get('https://apis.map.qq.com/ws/geocoder/v1/', {
    searchParams: {
      key: QQLBS_KEY,
      address: address,
    },
  }).json<IResult<IGeocoder>>();

  // Enforce QPS limit
  await setTimeout(1000 / QPS);

  if (result && result.reliability >= 7) {
    return result.location;
  }
}
