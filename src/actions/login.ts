'use server';
import dayjs from "dayjs";
import { cookies } from "next/headers";
import { updateToken } from "../services/ajax";

// on server
export async function syncLoginStateToServer(data: { uid: number, token: string }) {
  const { uid, token } = data
  const expires = dayjs().add(1, 'year').toDate()
  cookies().set('token', token, { expires, httpOnly: true })
  cookies().set('uid', uid.toString(), { expires, httpOnly: true })
}
