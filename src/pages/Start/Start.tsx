import type { ReactElement } from "react";

import { Brand } from "../../components/Brand/Brand";
import formaDecorativa from "../../assets/forma-decorativa.svg";
import "./style.css";

type StartProps = {
  onEnterAsStudent: () => void;
  onEnterAsProfessor: () => void;
};

export const Start = ({
  onEnterAsStudent,
  onEnterAsProfessor,
}: StartProps): ReactElement => {
  return (
    <main className="inicio-perfil" data-node-id="2022:2">
      <div className="inicio-perfil__shell">
        <img
          className="inicio-perfil__forma"
          src={formaDecorativa}
          alt=""
          aria-hidden="true"
        />

        <div className="inicio-perfil__conteudo">
          <div className="inicio-perfil__marca-area">
            <Brand />
          </div>

          <p className="inicio-perfil__descricao">
            Uma expedição para descobrir
            <br />
            o mundo da estereoquímica.
          </p>

          <section
            className="inicio-perfil__escolha"
            aria-labelledby="inicio-perfil-titulo"
          >
            <h2 id="inicio-perfil-titulo">
              Como você deseja acessar o MiraCast?
            </h2>
            <button
              className="inicio-perfil__botao"
              type="button"
              onClick={onEnterAsStudent}
            >
              <span className="inicio-perfil__icone" aria-hidden="true">
                👤
              </span>
              <span>Entrar como Aluno</span>
            </button>
            <button
              className="inicio-perfil__botao"
              type="button"
              onClick={onEnterAsProfessor}
            >
              <span className="inicio-perfil__icone" aria-hidden="true">
                👩‍🔬
              </span>
              <span>Entrar como Professor</span>
            </button>
          </section>

          <footer className="inicio-perfil__creditos">
            <p>PROFQUI/UFRN · Dissertação de Mestrado</p>
            <p>Fundamentada na Teoria de Galperin</p>
          </footer>
        </div>
      </div>
    </main>
  );
};