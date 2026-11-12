import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { demandHistory, demandMultiplier } from "../data";

type SectorPrice = { sector: string; precio: number };
type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;

const money = (value: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const chartTooltip = {
  contentStyle: { border: "1px solid #eeedf4", borderRadius: 12, fontFamily: "Inter, sans-serif", fontSize: 12 },
  formatter: (value: TooltipValue, name: number | string | undefined): [string, string] => {
    const label = String(name ?? "");
    const displayValue = Array.isArray(value) ? value.join(", ") : String(value ?? "—");
    return [`${displayValue}${label.includes("m²") ? " / m²" : ""}`, label];
  },
};

export default function AdminCharts({ prices }: { prices: SectorPrice[] }) {
  return (
    <div className="analytics-grid">
      <article className="chart-card chart-card--wide">
        <div className="chart-heading"><div><span className="eyebrow"><ArrowUpRight size={14} /> TENDENCIAS DE DEMANDA</span><h2>Estacionalidad del mercado</h2></div><span className="chart-period"><span className="chart-period__dot" /> Índice de consultas · demo</span></div>
        <div aria-label="Consultas por mes, con picos en semanas de matrícula" className="chart-area">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={demandHistory} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#efedf5" strokeDasharray="3 5" vertical={false} />
              <XAxis axisLine={false} dataKey="month" tick={{ fill: "#85858f", fontSize: 11 }} tickLine={false} />
              <YAxis axisLine={false} domain={[0, 110]} tick={{ fill: "#85858f", fontSize: 11 }} tickLine={false} />
              <Tooltip {...chartTooltip} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Line activeDot={{ r: 5 }} dataKey="regular" name="Semestre regular" stroke="#a49ae9" strokeWidth={2.5} type="monotone" />
              <Line activeDot={{ r: 5 }} dataKey="matriculation" name="Semana de matrícula" stroke="#6c5ce7" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-note"><span className="chart-note__icon"><Sparkles size={15} /></span>En matrícula se estima hasta <strong>{demandMultiplier(21).toFixed(1)}×</strong> de demanda y precios +12%. <span>Escenario ilustrativo</span></div>
      </article>
      <article className="chart-card">
        <div className="chart-heading"><div><span className="eyebrow"><ArrowUpRight size={14} /> PRECIO POR M²</span><h2>Valor mediano por sector</h2></div></div>
        <div className="median-chart">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={prices} margin={{ top: 12, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#efedf5" strokeDasharray="3 5" vertical={false} />
              <XAxis axisLine={false} dataKey="sector" tick={{ fill: "#777780", fontSize: 9 }} tickLine={false} />
              <YAxis axisLine={false} tick={{ fill: "#85858f", fontSize: 10 }} tickLine={false} />
              <Tooltip {...chartTooltip} formatter={(value: TooltipValue): [string, string] => [money(Number(value ?? 0)), "Mediana USD / m²"]} />
              <Bar dataKey="precio" name="Mediana USD / m²" radius={[6, 6, 0, 0]}>
                {prices.map((entry, index) => <Cell fill={index === 0 ? "#6c5ce7" : "#c2baf4"} key={entry.sector} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <span className="chart-footnote">Cálculo sobre {prices.length} sectores · datos simulados</span>
      </article>
    </div>
  );
}
