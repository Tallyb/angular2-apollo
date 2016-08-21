import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { graphql } from 'angular2-apollo';
import { ApolloQueryResult } from 'apollo-client';

import { User } from './user.interface';

import gql from 'graphql-tag';

import 'rxjs/add/operator/debounceTime';

import template from './app.component.html';

interface Data {
  users: User[];
}

@Component({
  selector: 'app',
  template
})
@graphql({
  queries: (component: AppComponent) => ({
    data: {
      query: gql`
        query getUsers($name: String) {
          users(name: $name) {
            firstName
            lastName
            emails {
              address
              verified
            }
          }
        }
      `,
      variables: {
        name: component.nameFilter,
      },
    },
  }),
  mutations: (component: AppComponent) => ({
    addUser: (firstName: any) => ({
      mutation: gql`
        mutation addUser(
          $firstName: String!
          $lastName: String!
        ) {
          addUser(
            firstName: $firstName
            lastName: $lastName
          ) {
            firstName
            lastName,
            emails {
              address
              verified
            }
          }
        }
      `,
      variables: {
        firstName,
        lastName: component.lastName,
      },
    }),
  }),
})
export class AppComponent implements OnInit {
  public data: any;
  public firstName: string;
  public lastName: string;
  public nameControl = new FormControl();
  public nameFilter: string;
  public addUser: (firstName: string) => Promise<any>;

  public ngOnInit() {
    this.nameControl.valueChanges.debounceTime(300).subscribe(name => {
      this.nameFilter = name;
    });
  }

  public newUser(firstName: string) {
    this.addUser(firstName)
      .then(({ data }: ApolloQueryResult) => {
        console.log('got data', data);

        // get new data
        this.data.refetch();
      })
      .catch((errors: any) => {
        console.log('there was an error sending the query', errors);
      });
  }
}
