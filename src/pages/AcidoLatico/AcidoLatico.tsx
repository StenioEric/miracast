import { questions } from "../../domain/questions";
import type { Answer } from "../../domain/expedition";
import { ActivityLayout } from "../../components/ActivityLayout/ActivityLayout";
import { ChoiceQuestion } from "../../components/ActivityResponse/ActivityResponse";
import { Button } from "../../components/Button/Button";
import { lactateLigands } from "../../utils/moleculeGeometry";
import "./AcidoLatico.css";

const [hydrogen, hydroxyl, methyl, carboxyl] = lactateLigands;
const carbons = [
  { position: "methyl", symbol: methyl, label: `Carbono do ${methyl}` },
  { position: "central", symbol: "C*", label: "Carbono central" },
  { position: "carboxyl", symbol: carboxyl, label: `Carbono do ${carboxyl}` },
] as const;

export function AcidoLatico({ onContinue }: { onContinue: (answer: Answer) => void }) {
  return (
    <ActivityLayout
      step="lactic-acid"
      title="MISSÃO 4.1 - ÁCIDO LÁTICO"
      guidance="Agora você está sozinho — sem o protocolo. Esta é a molécula do ácido lático, a mesma do iogurte que você come. Encontre o carbono quiral."
    >
      <ChoiceQuestion
        question={questions["lactic-acid"]}
        onContinue={onContinue}
        illustration={({ selected, disabled, onSelect }) => (
          <figure className="lactic-acid">
            <figcaption>
              <h2>Toque no carbono que você acredita ser o quiral:</h2>
              <p>
                ácido lático (do iogurte) ·{" "}
                <span className="lactic-acid__formula">CH₃–C*(OH)(H)–COOH</span>
              </p>
            </figcaption>
            <div className="lactic-acid__diagram" role="group" aria-label="Carbonos do ácido lático">
              {carbons.map(({ position, symbol, label }, index) => (
                <Button
                  key={position}
                  className={`lactic-acid__carbon--${position}`}
                  variant="secondary"
                  aria-label={label}
                  aria-pressed={selected === index}
                  disabled={disabled}
                  onClick={() => onSelect(index)}
                >
                  {symbol}
                </Button>
              ))}
              <span className="lactic-acid__hydroxyl">{hydroxyl}</span>
              <span className="lactic-acid__hydrogen">{hydrogen}</span>
              <span className="lactic-acid__dashed-bond" aria-hidden="true" />
            </div>
          </figure>
        )}
      />
    </ActivityLayout>
  );
}
