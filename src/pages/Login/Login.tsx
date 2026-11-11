import type { ReactElement } from "react";

import "./style.css";

export const Login = (): ReactElement => {
  return (
    <div className="miracast-entrada-na">
      <div className="forma-decorativa" />
      <div className="conteudo">
        <div className="identidade-miracast">
          <div className="marca">MiraCast</div>
          <div className="subttulo">
            
            <p className="t-tulo-da-aventura">O Segredo do Cristal Quiral</p>
          </div>
        </div>
        <div className="subttulo-wrapper">
          <div className="subttulo">
            <p className="text-wrapper">
              PROFQUI · UFRN · Dissertação de Mestrado
            </p>
          </div>
        </div>
        <div className="identificao-do">
          <div className="pergunta-de-boas">
            <div className="pergunta">Entrar em uma sala</div>
          </div>
          <div className="instrues">
            <p className="descri-o">
              Digite o código de 6 letras fornecido pelo professor para começar
              o jogo.
            </p>
          </div>
          <div className="campo-de-nome">
            <div className="placeholder">CÓDIGO</div>
          </div>
          <div className="ao-de-entrada">
            <div className="entrar-na-expedio">
              <div className="r-tulo-da-a-o">ENTRAR NA SALA</div>
            </div>
          </div>
        </div>
        <div className="crditos-acadmicos">
          <p className="institui-o-e">PROFQUI/UFRN · Dissertação de Mestrado</p>
          <p className="fundamenta-o-te-rica">
            Fundamentada na Teoria de Galperin
          </p>
        </div>
      </div>
    </div>
  );
};
