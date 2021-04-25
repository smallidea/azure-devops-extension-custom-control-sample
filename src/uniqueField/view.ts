// import { Markdown } from './markdown';
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { Model } from "./model";
import { WorkItemField } from 'TFS/WorkItemTracking/Contracts';

export class View {

    private currentValue = "";

    private _combo: JQuery<HTMLElement>;

    constructor(private model: Model, private onInputChanged: Function) {
        this._init();
    }

    private _init(): void {
        $(".container").remove();

        var container = $("<div />");
        container.addClass("container");

        var control = $('<div />');
        control.addClass('control');

        var workItemControl = $('<div />');
        workItemControl.addClass('work-item-control');

        this._combo = $('<div />');
        this._combo.addClass('combo');
        this._combo.addClass('input-text-box');

        var wrap = $("<div />");
        wrap.addClass("wrap");

        this.currentValue = String(this.model.getCurrentValue());

        var field = $("<input />").attr("type", "text");
        field.val(this.currentValue);
        field.attr("autocomplete", this.currentValue);
        field.attr("aria-valuenow", this.currentValue);
        field.on("keyup", (evt: JQueryKeyEventObject) => {
            this._inputChanged();
        }).on('focus', (evt: JQueryKeyEventObject) => {
            this._gotFocus();
        }).on('blur', (evt: JQueryKeyEventObject) => {
            this._lostFocus();
        });

        wrap.append(field);
        this._combo.append(wrap);
        workItemControl.append(this._combo);
        control.append(workItemControl);
        container.append(control);
        $("body").append(container);

        VSS.resize(container.width(), container.height());
    }

    private _inputChanged(): void {
        let newValue = $("input").val();
        if (this.onInputChanged) {
            this.onInputChanged(newValue);
        }
    }

    private _gotFocus(): void {
        this._combo.addClass('focus');
    }

    private _lostFocus(): void {
        this._combo.removeClass('focus');
    }

    public update(value: string) {
        this.currentValue = String(value);
        $("input").val(this.currentValue);

       
    }
}