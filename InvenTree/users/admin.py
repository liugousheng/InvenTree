# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.translation import ugettext_lazy as _

from django.contrib import admin
from django import forms
from django.contrib.auth import get_user_model
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth.models import Group

from users.models import RuleSet

User = get_user_model()


class RuleSetInline(admin.TabularInline):
    model = RuleSet
    can_delete = False
    verbose_name = 'Ruleset'
    verbose_plural_name = 'Rulesets'
    fields = ['name'] + [option for option in RuleSet.RULE_OPTIONS]
    readonly_fields = ['name']
    max_num = len(RuleSet.RULESET_CHOICES)
    min_num = 1
    extra = 0


class InvenTreeGroupAdminForm(forms.ModelForm):

    class Meta:
        model = Group
        exclude = []
        fields = [
            'name',
            'users',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance.pk:
            # Populate the users field with the current Group users.
            self.fields['users'].initial = self.instance.user_set.all()

    # Add the users field.
    users = forms.ModelMultipleChoiceField(
        queryset=User.objects.all(),
        required=False,
        widget=FilteredSelectMultiple('users', False),
        label=_('Users'),
        help_text=_('Select which users are assigned to this group')
    )

    def save_m2m(self):
        # Add the users to the Group.
        # Deprecated in Django 1.10: Direct assignment to a reverse foreign key
        #                            or many-to-many relation

        self.instance.user_set.set(self.cleaned_data['users'])

    def save(self, *args, **kwargs):
        # Default save
        instance = super().save()
        # Save many-to-many data
        self.save_m2m()
        return instance


class RoleGroupAdmin(admin.ModelAdmin):
    """
    Custom admin interface for the Group model
    """

    form = InvenTreeGroupAdminForm

    inlines = [
        RuleSetInline,
    ]

    def get_formsets_with_inlines(self, request, obj=None):
        for inline in self.get_inline_instances(request, obj):
            # Hide RuleSetInline in the 'Add role' view
            if not isinstance(inline, RuleSetInline) or obj is not None:
                yield inline.get_formset(request, obj), inline

    filter_horizontal = ['permissions']

    # Save inlines before model
    # https://stackoverflow.com/a/14860703/12794913
    def save_model(self, request, obj, form, change):
        if obj is not None:
            # Save model immediately only if in 'Add role' view
            super().save_model(request, obj, form, change)
        else:
            pass  # don't actually save the parent instance

    def save_formset(self, request, form, formset, change):
        formset.save()  # this will save the children
        form.instance.save()  # form.instance is the parent


admin.site.unregister(Group)
admin.site.register(Group, RoleGroupAdmin)
