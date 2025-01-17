"use client" 

import TrendGenerator from './components/TrendGenerator';
import '../index.css'; // Import global CSS
import Ticker from 'framer-motion-ticker';


export default function Home() {
  const colors = ['#632bf3', '#f122c8', '#f16022', '#9ef344', '#44d3f3'];

  return (
    <main className="dont look under the hood">
        <div className='Tickers'>
        <Ticker duration={10}>
            {colors.map((item, index) => (
              <h1>MEAN</h1>))
            }
        </Ticker>
        <Ticker duration={12}>
            {colors.map((item, index) => (
              <h1>NEWS</h1>))
            }
        </Ticker>
        </div>
        <TrendGenerator />
    </main>
  );
}