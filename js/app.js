import { el, text, setChildren, setStyle, setAttr } from "https://redom.js.org/redom.es.min.js";

window.addEventListener('DOMContentLoaded', async() => {

    //TODO : Pasar el cambio de la validacion del prefijo del Cuit (Solo app.js)

    //#region "Fake Database"

    const fetchTiposClaveUnicaFamiliar = () => Promise.resolve([
        { value : "01", text : "CUIT" },
        { value : "02", text : "CUIL" },
        { value : "03", text : "CDI" },
        { value : "05", text : "Residente del exterior (NIF/TIN)" }
    ]);
    const tiposClaveUnica   = await fetchTiposClaveUnicaFamiliar();

    const fetchPaisesEmisoresTINFamiliar  = () => Promise.resolve([
        { value : "02", text : "BOLIVIA", min: "09", max : "16", flag : "🇧🇴"},
        { value : "03", text : "BRASIL", min: "14", max : "16", flag : "🇧🇷"},
        { value : "04", text : "CHINA", min: "15", max : "20", flag : "🇨🇳"},
        { value : "05", text : "ESPAÑA", min: "09", max : "16", flag : "🇪🇸"},
        { value : "06", text : "ESTADOS UNIDOS", min: "09", max : "16", flag : "🇺🇸"},
        { value : "07", text : "OTRO", min: "05", max : "20", flag : "🇺🇷"},
        { value : "08", text : "PARAGUAY", min: "09", max : "16", flag : "🇵🇾"},
        { value : "08", text : "URUGUAY", min: "12", max : "16", flag : "🇺🇾"}
    ]);  
    const paisesEmisoresTIN  = await fetchPaisesEmisoresTINFamiliar();

    const fetchTiposDocumentoFamiliar  = () => Promise.resolve([
        { value : "96", text : "DNI"},
        { value : "90", text : "Libreta de Enrolamiento"},
        { value : "89", text : "Libreta Cívica"},
        { value : "94", text : "Pasaporte"},
        { value : "98", text : "DNI Extranjero"}
    ]);  
    const tiposDocumento  = await fetchTiposDocumentoFamiliar();

    const fetchParentescosFamiliar  = () => Promise.resolve([
        { value : "01", text : "Padres"},
        { value : "02", text : "Hijos"},
        { value : "03", text : "Cónyuge"},
        { value : "04", text : "Conviviente"},
        { value : "05", text : "Suegros"},
        { value : "06", text : "Nuera o Yerno"},
        { value : "07", text : "Hijastros"},
        { value : "08", text : "Hermanos"},
        { value : "09", text : "Abuelos"},
        { value : "10", text : "Nietos"}
    ]);  
    const parentescos  = await fetchParentescosFamiliar();

    const fetchPaisesResidencia = () => Promise.resolve([
        { value : "01", text : "ARGENTINA" },
        { value : "02", text : "BOLIVIA" },
        { value : "03", text : "BRASIL" },
        { value : "04", text : "CHINA" },
        { value : "05", text : "ESPAÑA" },
        { value : "06", text : "ESTADOS UNIDOS" },
        { value : "07", text : "OTRO" },
        { value : "08", text : "PARAGUAY" },
        { value : "08", text : "URUGUAY" }
    ]);  
    const paisesResidencia = await fetchPaisesResidencia();

    const fetchCargos = () => Promise.resolve([
        { value : "00", text : "NO APLICA" },
        { value : "01", text : "OTRO CARGO EN EL ORGANO DE ADM" },
        { value : "02", text : "PRESIDENTE" },
        { value : "03", text : "VICEPRESIDENTE" },
        { value : "04", text : "DIRECTOR" },
        { value : "05", text : "CONSEJERO" },
        { value : "06", text : "INTEGRANTE DE COMISION DIRECTIVA" },
        { value : "07", text : "SOCIO GERENTE" },
        { value : "08", text : "NO POSEE CARGO EN EL ORGANO DE ADM" }
    ]);
    const cargos = await fetchCargos();

    //#endregion

    let vinculados = [];

    const vinculadosExistInLocalStorage = localStorage.getItem('vinculados') !== null;

    if (vinculadosExistInLocalStorage) vinculados = JSON.parse(localStorage.getItem('vinculados'));

    let frmFamiliar;
    let frmEmpresa;

    const showOrHideByCondition = booleanShowCondition => booleanShowCondition ? {'display' : 'block'} : {'display' : 'none'};

    const validateCuilt = cuilt => {
        
        if (cuilt.length != 11) return 'El CUIL debe tener 11 caracteres';
        
        let rv = false;
        let resultado = 0;
        const codes = "6789456789";
        let verificador = parseInt(cuilt[cuilt.length - 1]);
        let x = 0;

        while (x < 10) {
            let digitoValidador = parseInt(codes.substring(x, x + 1));
            if (isNaN(digitoValidador)) digiUrloValidador = 0;
            let digito = parseInt(cuilt.substring(x, x + 1));
            if (isNaN(digito)) digito = 0;
            let digitoValidacion = digitoValidador * digito;
            resultado += digitoValidacion;
            x++;
        }

        resultado = resultado % 11;
        rv = (resultado == verificador);

        if (rv === false) return 'El CUIL no es valido';

        return '';

    }

    class Control{

        constructor(attributes, options = null){

            const type = options ? 'select' : 'input';

            attributes.placeholder = attributes.name.replaceAll('_',' ').toUpperCase();
            attributes.required = attributes.required ?? true;
            attributes.class = 'form-control';
            
            this.element = el(type, attributes, type === 'select' ? options.map(option => el('option', {'textContent' : option.text,'value' : option.value})) : null);
            this.message = el('small.text-danger');

            this.element.onchange = () => this.validate();

            this.el = el('.form-group', [this.element, this.message]);
        }

        validate(){
            
            this.message.textContent = this.element.validationMessage;

            // CUSTOM VALIDATIONS

            if (this.element.dataset.validation === 'cuilt' && this.message.textContent === '') {

                const isPersonaFisica = this.element.parentNode.parentNode.parentNode.id.includes('familiar');

                const isValidCuiltPrefix = (this.element.value.startsWith("2") && isPersonaFisica) || (this.element.value.startsWith("3") && !isPersonaFisica);

                this.message.textContent = isValidCuiltPrefix ? validateCuilt(this.element.value) : `El cuit ingresado no pertenece a una persona ${isPersonaFisica ? 'fisica' : 'juridica'}`;

            };

            if (this.element.dataset.validation === 'tin' && this.message.textContent === '') {

                const form = this.element.parentNode.parentNode; //Para saber en que combo de pais_emisor_TIN buscar (Familiar o Empresa)
                
                const props = paisesEmisoresTIN.find(x => x.value === form.querySelector('[name="pais_emisor_TIN"]').value);

                const errorInLength = this.element.value.length < Number(props.min) || this.element.value.length > Number(props.max);

                this.message.textContent = errorInLength ? `El NIF/TIN asociado a ${props.text} debe tener un mínimo de ${Number(props.min)} caracteres y un máximo de ${props.max}` : '';

            };

            // Validacion del porcentaje segun cargo :  Si el cargo no es 01, se aceptan valores nulos

            if (this.element.dataset.validation === 'participacion_porcentual' && this.message.textContent === '') {

                const cargo_funcion = document.querySelector('[name="cargo_funcion"]').value;
                
                this.message.textContent = cargo_funcion === "01" && this.element.value < 1 ? "La participación porcentual para el cargo especificado debe ser mayor a 0%" : '';
            
            };

        }

    }

    class Familiar{

        constructor(obj = null){

            this.tipoIdentificacion = new Control({'name' : 'tipo_identificacion'}, tiposClaveUnica);

            this.paisEmisorTIN = new Control({'name' : 'pais_emisor_TIN'}, paisesEmisoresTIN);
            
            this.identificacion = new Control({'name' : 'identificacion','type' : 'number', 'data-validation' : obj && obj.tipo_identificacion === '05' ? 'tin' : 'cuilt', 'value' : obj ? obj.identificacion : '' });

            this.nombre = new Control({'name' : 'nombre','type' : 'text', 'maxlength' : 100, 'value' : obj ? obj.nombre : '' });

            this.apellido = new Control({'name' : 'apellido','type' : 'text', 'maxlength' : 100, 'value' : obj ? obj.apellido : '' });

            this.tipo_documento = new Control({'name' : 'tipo_documento'}, tiposDocumento);

            this.nro_documento = new Control({'name' : 'nro_documento','type' : 'number', 'min' : 100000, 'max' : 99999999, 'value' : obj ? obj.nro_documento : '' });

            this.parentesco = new Control({'name' : 'parentesco'}, parentescos);

            this.tipoIdentificacion.element.value = obj ? obj.tipo_identificacion : '01';
            this.paisEmisorTIN.element.value = obj ? obj.pais_emisor_TIN : '02';
            this.tipo_documento.element.value = obj ? obj.tipo_documento : '96' ;
            this.parentesco.element.value = obj ? obj.parentesco : '01';

            setStyle(this.paisEmisorTIN, showOrHideByCondition(this.tipoIdentificacion.element.value === '05'));
            setStyle(this.tipo_documento, showOrHideByCondition(!(this.tipoIdentificacion.element.value === '05')));
            setStyle(this.nro_documento, showOrHideByCondition(!(this.tipoIdentificacion.element.value === '05')));

            setAttr(this.nro_documento.element, {'required' : this.tipoIdentificacion.element.value !== '05'});


            this.tipoIdentificacion.element.onchange = () => {

                //Blanqueo el Nro identificacion asociado al tipo
                this.identificacion.element.value = '';
                this.identificacion.message.textContent = '';

                const isResidenteDelExterior = this.tipoIdentificacion.element.value === '05';

                // Segun el valor que le paso, va a hacer una validacion u otra en Control.validate()
                this.identificacion.element.dataset.validation = isResidenteDelExterior ? 'tin' : 'cuilt';

                setStyle(this.paisEmisorTIN, showOrHideByCondition(isResidenteDelExterior));
                setStyle(this.tipo_documento, showOrHideByCondition(!isResidenteDelExterior));
                setStyle(this.nro_documento, showOrHideByCondition(!isResidenteDelExterior));

                setAttr(this.nro_documento.element, {'required' : this.tipoIdentificacion.element.value !== '05'});

            };

            this.form = [
                this.tipoIdentificacion,
                this.paisEmisorTIN,
                this.identificacion,
                this.nombre,
                this.apellido,
                this.tipo_documento,
                this.nro_documento,
                this.parentesco
            ]


            this.el = el('.content', this.form);

        }

        save(){
            
            this.form.forEach(ctl => ctl.validate());

            const errors = Array.from(document.querySelectorAll('#content-familiar small.text-danger')).reduce((sum, item) => sum + (item.textContent === '' ? 0 : 1), 0);

            if (errors > 0) return;

            let vinculado = {};

            this.form.forEach(ctl => vinculado[ctl.element.name] = ctl.element.value);

            let vinculadoInMemory = vinculados.find(x => x.identificacion === document.querySelector('#content-familiar [name="identificacion"]').value);

            if (!vinculadoInMemory) { // Es alta

                vinculado['tipo'] = 'Familiar';

                vinculados.push(vinculado);

            } else { // Es modificacion
                
                vinculadoInMemory.apellido = vinculado.apellido;
                vinculadoInMemory.nombre = vinculado.nombre;
                vinculadoInMemory.nro_documento = vinculado.nro_documento;
                vinculadoInMemory.pais_emisor_TIN = vinculado.pais_emisor_TIN;
                vinculadoInMemory.parentesco = vinculado.parentesco;
                vinculadoInMemory.tipo_documento = vinculado.tipo_documento;
                vinculadoInMemory.tipo_identificacion = vinculado.tipo_identificacion;

            }

            $('#familiarModal').modal('toggle');

            setChildren(document.querySelector('#table-vinculados'), new Table(vinculados));

        }

    }

    class Empresa{

        constructor(obj = null){

            this.tipoIdentificacion = new Control({'name' : 'tipo_identificacion'}, tiposClaveUnica.filter(x => x.value === '01' || x.value === '05'));

            this.paisEmisorTIN = new Control({'name' : 'pais_emisor_TIN'}, paisesEmisoresTIN);
            
            this.identificacion = new Control({'name' : 'identificacion','type' : 'number', 'data-validation' : obj && obj.tipo_identificacion === '05' ? 'tin' : 'cuilt', 'value' : obj ? obj.identificacion : '' });

            this.razonSocial = new Control({'name' : 'razon_social','type' : 'text', 'maxlength' : 100, 'value' : obj ? obj.razon_social : '' });

            this.paisResidenciaFiscal = new Control({'name' : 'pais_residencia_fiscal'}, paisesResidencia);

            this.cargoFuncion = new Control({'name' : 'cargo_funcion'}, cargos);

            this.participacionPorcentual = new Control({'name' : 'participacion_porcentual','type' : 'number', 'min' : 0, 'max' : 100,'data-validation' : 'participacion_porcentual', 'value' : obj ? obj.participacion_porcentual : '' });

            this.patrimonioNeto = new Control({'name' : 'patrimonio_neto','type' : 'number', 'value' : obj ? obj.patrimonio_neto : '' });

            this.fechaUltimoBalance = new Control({'name' : 'fecha_ultimo_balance','type' : 'date', 'value' : obj ? obj.fecha_ultimo_balance : '' });

            this.tipoIdentificacion.element.value = obj ? obj.tipo_identificacion : '01';
            this.paisEmisorTIN.element.value = obj ? obj.pais_emisor_TIN : '02';
            this.paisResidenciaFiscal.element.value = obj ? obj.pais_residencia_fiscal : '01';
            this.cargoFuncion.element.value = obj ? obj.cargo_funcion : '00';


            setStyle(this.paisEmisorTIN, showOrHideByCondition(this.tipoIdentificacion.element.value === '05'));
     
            // Si es residente del Exterior. lo dejo elegir el pais de Residencia...sino siempre va a ser Argento
            setAttr(this.paisResidenciaFiscal.element, {'disabled' : this.tipoIdentificacion.element.value !== '05', 'value' : this.tipoIdentificacion.element.value !== '05' ? '01' : this.paisResidenciaFiscal.element.value});

            this.tipoIdentificacion.element.onchange = () => {

                //Blanqueo el Nro identificacion asociado al tipo
                this.identificacion.element.value = '';
                this.identificacion.message.textContent = '';

                const isResidenteDelExterior = this.tipoIdentificacion.element.value === '05';

                // Segun el valor que le paso, va a hacer una validacion u otra en Control.validate()
                this.identificacion.element.dataset.validation = isResidenteDelExterior ? 'tin' : 'cuilt';

                setStyle(this.paisEmisorTIN, showOrHideByCondition(isResidenteDelExterior));

                setAttr(this.paisResidenciaFiscal.element, {'disabled' : this.tipoIdentificacion.element.value !== '05', 'value' : this.tipoIdentificacion.element.value !== '05' ? '01' : this.paisResidenciaFiscal.element.value});

            };

            this.form = [
                this.tipoIdentificacion,
                this.paisEmisorTIN,
                this.identificacion,
                this.razonSocial,
                this.paisResidenciaFiscal,
                this.cargoFuncion,
                this.participacionPorcentual,
                this.patrimonioNeto,
                this.fechaUltimoBalance
            ]


            this.el = el('.content', this.form);

        }

        save(){
            
            this.form.forEach(ctl => ctl.validate());

            const errors = Array.from(document.querySelectorAll('#content-empresa small.text-danger')).reduce((sum, item) => sum + (item.textContent === '' ? 0 : 1), 0);

            if (errors > 0) return;

            let vinculado = {};

            this.form.forEach(ctl => vinculado[ctl.element.name] = ctl.element.value);

            let vinculadoInMemory = vinculados.find(x => x.identificacion === document.querySelector('#content-empresa [name="identificacion"]').value);

            if (!vinculadoInMemory) { // Es alta

                vinculado['tipo'] = 'Empresa';

                vinculados.push(vinculado);

            } else { // Es modificacion

                console.log(vinculadoInMemory)
                
                vinculadoInMemory.cargo_funcion = vinculado.cargo_funcion;
                vinculadoInMemory.fecha_ultimo_balance = vinculado.fecha_ultimo_balance;
                vinculadoInMemory.pais_emisor_TIN = vinculado.pais_emisor_TIN;
                vinculadoInMemory.pais_residencia_fiscal = vinculado.pais_residencia_fiscal;
                vinculadoInMemory.participacion_porcentual = vinculado.participacion_porcentual;
                vinculadoInMemory.patrimonio_neto = vinculado.patrimonio_neto;
                vinculadoInMemory.razon_social = vinculado.razon_social;
                vinculadoInMemory.tipo_identificacion = vinculado.tipo_identificacion;

            }

            $('#empresaModal').modal('toggle');

            setChildren(document.querySelector('#table-vinculados'), new Table(vinculados));

        }


    }

    class Table{

        constructor(vinculados){

            let rows = [];

            setStyle(document.querySelector('#table-area'), showOrHideByCondition(vinculados.length > 0)); // Muesto el area de la tabla si hay informacion

            localStorage.setItem('vinculados', JSON.stringify(vinculados)); //* Guardo la lista en local Storage

            vinculados.forEach((vinculado,index) => {

                const buttonClassName = vinculado.tipo === 'Familiar' ? 'btn-outline-primary' : 'btn-outline-success';

                const descripcion = vinculado.tipo === 'Familiar' ? vinculado.nombre + ' ' + vinculado.apellido : vinculado.razon_social;
                const identificacion = vinculado.tipo_identificacion !== '05' ? vinculado.identificacion : vinculado.identificacion + ' ' + paisesEmisoresTIN.find(x => x.value === vinculado.pais_emisor_TIN).flag;
                
                this.btnEdit = el(`button.btn.${buttonClassName}.mx-1`, el('i.fa.fa-pencil'));
                this.btnDelete = el(`button.btn.${buttonClassName}.mx-1`, el('i.fa.fa-trash'));

                this.btnEdit.onclick = () => {

                    if (vinculado.tipo === 'Familiar') {

                        frmFamiliar = new Familiar(vinculado);
                        
                        setChildren(document.querySelector('#content-familiar'), frmFamiliar);
                        
                        $('#familiarModal').modal('toggle');

                    }

                    if (vinculado.tipo === 'Empresa') {

                        frmEmpresa = new Empresa(vinculado);

                        setChildren(document.querySelector('#content-empresa'), frmEmpresa);
                        
                        $('#empresaModal').modal('toggle');

                    }

                };

                this.btnDelete.onclick = () => {

                    const index = vinculados.findIndex(x => x.identificacion === vinculado.identificacion);
  
                    if(index !== -1) vinculados.splice(index,1);

                    setChildren(document.querySelector('#table-vinculados'), new Table(vinculados));

                };

                const row = el('tr', [
                    el('th', {'textContent' : index + 1 , 'scope' : 'row'}),
                    el('td', {'textContent' : vinculado.tipo.toUpperCase()}),
                    el('td', {'textContent' : descripcion.toUpperCase()}),
                    el('td', text(identificacion)),
                    el('td', [this.btnEdit, this.btnDelete])
                ]);

                rows.push(row);

            });

            this.el = el('tbody',rows);

        }

    }



    document.querySelector('#showFamiliar').addEventListener('click', () => {
        
        frmFamiliar = new Familiar();

        setChildren(document.querySelector('#content-familiar'), frmFamiliar);

    });

    document.querySelector('#saveFamiliar').addEventListener('click', () => frmFamiliar.save()); 


    document.querySelector('#showEmpresa').addEventListener('click', () => {
        
        frmEmpresa = new Empresa();

        setChildren(document.querySelector('#content-empresa'), frmEmpresa);

    });

    document.querySelector('#saveEmpresa').addEventListener('click', () => frmEmpresa.save());

    setChildren(document.querySelector('#table-vinculados'), new Table(vinculados));

});