import { ComponentFixture, TestBed } from "@angular/core/testing"
import { HeroesComponent } from "./heroes.component";
import { HeroService } from "src/app/services/hero.service";
import { Directive, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { Hero } from "src/app/models/hero";
import { of } from "rxjs";
import { By } from "@angular/platform-browser";
import { HeroComponent } from "../hero/hero.component";

@Directive({
    selector: '[routerLink]',
    host: {'(click)': 'onClick()'}
})
export class RouterLinkDirectiveStub {
    @Input('routerLink') linkParams: any;
    navigatedTo: any = null;

    onClick = () => {
        this.navigatedTo = this.linkParams;
    }
}

describe('HeroesComponent (shallow tests)', () => {
    let fixture: ComponentFixture<HeroesComponent>;
    let mockHeroService: any;
    let HEROES: Hero[];

    beforeEach(() => {
        HEROES = [
          {id: 1, name: 'SpiderDude', strength: 8},
          {id: 2, name: 'WonderFull', strength: 24},
          {id: 3, name: 'SuperDude', strength: 55},
        ];
        mockHeroService = jasmine.createSpyObj([
            'getHeroes',
            'addHero',
            'deleteHero'
        ]);

        TestBed.configureTestingModule({
            declarations: [
                HeroesComponent,
                HeroComponent,
                RouterLinkDirectiveStub
            ],
            providers: [
                {provide: HeroService, useValue: mockHeroService}
            ]
        })

        fixture = TestBed.createComponent(HeroesComponent);
    })

    it('should render each hero as a HeroComponent', () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));
        
        fixture.detectChanges();

        const heroComponentDEs = fixture.debugElement.queryAll(
            By.directive(HeroComponent)
        );
        expect(heroComponentDEs.length).toBe(3);
        for (let i = 0; i < heroComponentDEs.length; i++) {
            expect(
                heroComponentDEs[i].componentInstance.hero.name
            ).toEqual(
                HEROES[i].name
            )
        }

    })

    it(`should call component's delete function when the Hero
    app-heros' delete button is clicked`, () => {
        spyOn(fixture.componentInstance, 'delete');
        mockHeroService.getHeroes.and.returnValue(of(HEROES));

        fixture.detectChanges();

        const heroComponents = fixture.debugElement.queryAll(
            By.directive(HeroComponent)
        );

        heroComponents[0].query(By.css('button'))
            .triggerEventHandler('click', {
                stopPropagation: () => {}
            });
        
        expect(fixture.componentInstance.delete)
            .toHaveBeenCalledOnceWith(HEROES[0]);
    })

    it(`should call component's delete function when the Hero
    app-heros' delete event raised from app-hero`, () => {
        spyOn(fixture.componentInstance, 'delete');
        mockHeroService.getHeroes.and.returnValue(of(HEROES));

        fixture.detectChanges();

        const heroComponents = fixture.debugElement.queryAll(
            By.directive(HeroComponent)
        );
        
        // (<HeroComponent>heroComponents[0].componentInstance)
        //     .delete.emit(undefined);

        heroComponents[0].triggerEventHandler('delete', null);
        
        expect(fixture.componentInstance.delete)
            .toHaveBeenCalledOnceWith(HEROES[0]);
    })

    it(`should add a new hero to the hero list 
    when the add button clicked`, () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));
        fixture.detectChanges();
        const name = "Mr. Ice";
        mockHeroService.addHero.and.returnValue(of({
            id: 5,
            name: name,
            strength: 4
        }));
        const inputElement = fixture.debugElement.query(
            By.css('input')
        ).nativeElement;
        const addButton = fixture.debugElement.queryAll(
            By.css('button')
        )[0];

        inputElement.value = name;
        addButton.triggerEventHandler('click', null);
        fixture.detectChanges();

        const heroText = fixture.debugElement.query(By.css('ul'))
            .nativeElement.textContent;
        expect(heroText).toContain(name);
    })

    it('should have the correct route for the first hero', () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));
        fixture.detectChanges();

        const heroComponents = fixture.debugElement.queryAll(
            By.directive(HeroComponent)
        );

        let routerLink = heroComponents[0]
            .query(By.directive(RouterLinkDirectiveStub))
            .injector.get(RouterLinkDirectiveStub);
        
        heroComponents[0].query(By.css('a'))
            .triggerEventHandler('click', null);

        expect(routerLink.navigatedTo).toBe('/detail/1');
    })
})

