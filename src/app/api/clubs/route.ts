import connectToDatabase from '../../../lib/mongodb';
import Club from '../../../lib/models/Club';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    try {
        await connectToDatabase();
        const clubs = await Club.find({});
        return NextResponse.json(clubs);
    } catch (error) {
        console.error('Error reading savedData.json:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}